import { ROOM_URL } from '@common/environment';
import { BrevoMailerService } from '@modules/brevo-mailer/services/brevo-mailer.service';
import { DbService } from '@modules/db/db.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Appointments } from '@prisma/client';
import * as moment from 'moment';
import { I18nService } from 'nestjs-i18n';
import { CreateAppointmentInput } from '../dto/input/create-appointment.input';
import { ISendAppointmentContextInput } from '../dto/input/send-appointment';
import { UpdateAppointmentInput } from '../dto/input/update-appointment.input';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly db: DbService,
    private readonly email: BrevoMailerService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {
    // this.sendEmailNotifications();
  }

  // @Cron('0/15 * * * * *') // 15 sec
  // @Cron('* * * * * *') // every second
  // @Cron(CronExpression.EVERY_HOUR)
  // async sendEmailNotifications() {
  //   this.logger.log('Checking appointments for upcoming meetings.');

  //   // Fetch appointments scheduled to start within the next hour
  //   const upcomingAppointments = await this.fetchUpcomingAppointments();

  //   for (const appointment of upcomingAppointments) {
  //     //send email and generate token to every user
  //     const guestList = appointment.guestList;
  //     await this.appointmentEmails(guestList, appointment.id);
  //   }

  //   await this.db.appointments.updateMany({
  //     where: {
  //       id: {
  //         in: upcomingAppointments.map((app) => app.id),
  //       },
  //     },
  //     data: {
  //       isEmailSent: true,
  //     },
  //   });
  // }

  async fetchUpcomingAppointments(): Promise<Appointments[]> {
    const oneHourBefore = new Date(
      moment().add(1, 'h').startOf('hour').format(),
    );
    const oneHourLater = new Date(moment().add(1, 'h').endOf('hour').format()); // Calculate one hour from now
    const endHourPrevTime = new Date(moment().subtract(1, 'h').format());

    const upcomingAppointments = await this.db.appointments.findMany({
      where: {
        startTime: {
          gte: oneHourBefore,
          lte: oneHourLater,
        },
        isEmailSent: false,
        // Exclude if createdAt is within the current time, avoid duplicate sending
        createdAt: {
          lte: endHourPrevTime,
        },
      },
      include: {
        participants: true,
      },
    });

    return upcomingAppointments;
  }

  async createAppointment(createAppointmentInput: CreateAppointmentInput) {
    let existingAppointment;

    if (createAppointmentInput.code) {
      existingAppointment = await this.db.appointments.findUnique({
        where: {
          code: createAppointmentInput.code,
        },
      });
    }

    const users = await this.db.users.findMany({
      where: {
        email: {
          in: createAppointmentInput.email,
        },
      },
    });

    let appointment = existingAppointment;

    const participants = users.map((user) => user.email);

    const guestList = createAppointmentInput.email.filter(
      (email) => !participants.includes(email),
    );

    if (!existingAppointment) {
      const uniqueCode = await this.generateUniqueCode();

      appointment = await this.db.appointments.create({
        data: {
          title: createAppointmentInput.title,
          status: createAppointmentInput.status ?? '',
          startTime: createAppointmentInput.startTime,
          endTime: createAppointmentInput.endTime,
          description: createAppointmentInput.description,
          location: createAppointmentInput.location,
          code: createAppointmentInput.code
            ? createAppointmentInput.code
            : uniqueCode,
          roomType: createAppointmentInput.roomType,
          roomEnvironment: createAppointmentInput.roomEnvironment,
          guestList: guestList,
        },
      });

      const userPromises = users.map(async (user) => {
        const existingUserAppointment =
          await this.db.userAppointments.findFirst({
            where: {
              userId: user.id,
              appointmentId: appointment.id,
            },
          });

        if (!existingUserAppointment) {
          return this.db.userAppointments.create({
            data: {
              userId: user.id,
              appointmentId: appointment.id,
            },
          });
        }
      });

      await Promise.all(userPromises);
    }

    await this.appointmentEmails(createAppointmentInput.email, appointment.id);

    const response = {
      ...appointment,
      participants: participants,
    };
    return response;
  }

  async updateAppointment(updateAppointmentInput: UpdateAppointmentInput) {
    const appointment = await this.db.appointments.findUnique({
      where: {
        id: updateAppointmentInput.id,
      },
    });

    if (!appointment) {
      throw new NotFoundException(this.i18n.translate('appointment.NOT_FOUND'));
    }

    const users = await this.db.users.findMany({
      where: {
        email: {
          in: updateAppointmentInput.email,
        },
      },
    });

    //filter the participants list
    const participants = users.map((user) => user.email);

    //filter the guest list
    const guestList = updateAppointmentInput.email.filter(
      (email) => !participants.includes(email),
    );

    // Update the appointment
    await this.db.appointments.update({
      where: {
        id: updateAppointmentInput.id,
      },
      data: {
        title: updateAppointmentInput.title,
        status: updateAppointmentInput.status,
        startTime: updateAppointmentInput.startTime,
        endTime: updateAppointmentInput.endTime,
        description: updateAppointmentInput.description,
        location: updateAppointmentInput.location,
        code: updateAppointmentInput.code,
        roomType: updateAppointmentInput.roomType,
        roomEnvironment: updateAppointmentInput.roomEnvironment,
        guestList: guestList,
      },
    });

    // Remove all user appointments for the updated appointment
    if (updateAppointmentInput.email) {
      await this.db.userAppointments.deleteMany({
        where: { appointmentId: updateAppointmentInput.id },
      });

      // Link users to the updated appointment
      const userPromises = users.map(async (user) => {
        const existingUserAppointment =
          await this.db.userAppointments.findFirst({
            where: {
              userId: user.id,
              appointmentId: appointment.id,
            },
          });

        if (!existingUserAppointment) {
          return this.db.userAppointments.create({
            data: {
              userId: user.id,
              appointmentId: appointment.id,
            },
          });
        }
      });

      await Promise.all(userPromises);
    }

    // Send email to all users
    await this.appointmentEmails(updateAppointmentInput.email, appointment.id);

    const response = {
      ...appointment,
      participants: participants,
    };
    return response;
  }

  async findAppointment(id?: string) {
    let appointments;

    if (id) {
      appointments = await this.db.appointments.findMany({
        where: { id },
      });

      if (appointments.length <= 0) {
        throw new NotFoundException(
          this.i18n.translate('appointment.NOT_FOUND'),
        );
      }
    } else {
      appointments = await this.db.appointments.findMany();
    }

    const userAppointments = await this.db.userAppointments.findMany({
      include: {
        user: {
          // select: {
          //   email: true,
          // },
        },
      },
    });

    const formattedAppointments = appointments.map((appointment) => {
      const matchingUserAppointments = userAppointments.filter(
        (userAppointment) => userAppointment.appointmentId === appointment.id,
      );

      const participants = matchingUserAppointments.map(
        (userAppointment) => userAppointment.user.email,
      );

      return {
        ...appointment,
        participants,
      };
    });

    return formattedAppointments;
  }

  async createJoinLink(
    email,
    checkUserIfGuest,
    appointment: {
      code: string;
      startTime: Date;
      endTime: Date;
      roomType: string;
      roomEnvironment: string;
    },
  ) {
    const jwt = {
      email: email,
      code: appointment.code,
      roomType: appointment.roomType ?? '',
      roomEnvironment: appointment.roomEnvironment ?? '',
      validOn: appointment.startTime,
      expiredOn: appointment.endTime,
      isGuest: checkUserIfGuest ? false : true,
    };

    const token = this.jwtService.sign(jwt, {
      expiresIn: '30d',
    });

    const urlObject = new URL(ROOM_URL);
    urlObject.searchParams.append('token', token);

    return urlObject.href;
  }

  async appointmentEmails(emails: any[], appointmentId: string) {
    const emailPromises = emails.map(async (email) => {
      const checkAppointment = await this.db.appointments.findUnique({
        where: { id: appointmentId },
      });

      const checkUserIfGuest = await this.db.users.findUnique({
        where: {
          email: email,
        },
      });

      const URL = await this.createJoinLink(
        email,
        checkUserIfGuest,
        checkAppointment,
      );

      const emailData = {
        emailList: [email],
        subject: 'test',
        fileLocation: 'dist/template/test.hbs',
        params: {
          url: URL,
          startTime: moment(checkAppointment.startTime).format('ll hh:mm a'),
          endTime: moment(checkAppointment.endTime).format('ll hh:mm a'),
          status: checkAppointment.status,
          title: checkAppointment.title,
          code: checkAppointment.code,
          location: checkAppointment.location,
          description: checkAppointment.description,
          guest: emails,
        },
      };

      await this.sendBatchAppointmentEmails(
        emailData.emailList,
        emailData.params,
        emailData.subject,
        emailData.fileLocation,
      );
    });

    await Promise.all(emailPromises);
  }

  async sendBatchAppointmentEmails(
    recipients: string[],
    params: any,
    subject: string,
    fileLocation: string,
  ) {
    const messageVersions = recipients.map((recipientEmail) => {
      const context: ISendAppointmentContextInput = {
        to: [
          {
            email: recipientEmail,
          },
        ],
        params: params,
      };
      return {
        to: [{ email: recipientEmail }],
        params: context.params,
      };
    });

    await this.email.sendBatchEmailFromTemplate(
      messageVersions,
      subject,
      fileLocation,
    );
  }

  async deleteAppointments(ids: string[]) {
    const deletedAppointments = [];

    for (const id of ids) {
      const exist = await this.db.appointments.findUnique({ where: { id } });
      if (!exist) {
        deletedAppointments.push({
          id,
          success: false,
          error: this.i18n.translate('appointment.NOT_FOUND'),
        });
        continue;
      }

      await this.db.userAppointments.deleteMany({
        where: {
          appointmentId: id,
        },
      });

      await this.db.appointments.delete({ where: { id } });

      deletedAppointments.push({
        id,
        success: true,
      });
    }

    return deletedAppointments;
  }

  generateRandomCode(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    return code;
  }

  async generateUniqueCode(): Promise<string> {
    let code: string;

    do {
      code = this.generateRandomCode(8);
    } while (await this.isCodeDuplicate(code));

    return code;
  }

  async isCodeDuplicate(code: string): Promise<boolean> {
    const existingCode = await this.db.appointments.findUnique({
      where: { code },
    });

    return !!existingCode;
  }
}
