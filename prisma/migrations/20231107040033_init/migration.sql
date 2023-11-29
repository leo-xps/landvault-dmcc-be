-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "password" TEXT,
    "is_guest" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "guest_token" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT DEFAULT 'user',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "black_listed_token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "black_listed_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rpm_models" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "modelID" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "userID" TEXT NOT NULL,

    CONSTRAINT "rpm_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "room_description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "allowed_users" TEXT[],
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_members" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agora_chat_user_id" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "agoraID" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agora_chat_user_id_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_admin_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "server_admin_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agora_video_block_ids" (
    "id" TEXT NOT NULL,
    "kick_id" TEXT NOT NULL,
    "block_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agora_video_block_ids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agora_chat_room_ids" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_check_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agora_chat_room_ids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "userID" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "room_type" TEXT,
    "room_environment" TEXT,
    "location" TEXT,
    "description" TEXT,
    "is_email_sent" BOOLEAN NOT NULL DEFAULT false,
    "guest_list" TEXT[],
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_appointments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "appoinment_id" TEXT NOT NULL,

    CONSTRAINT "user_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortened_tokens" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shortened_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "black_listed_token_token_key" ON "black_listed_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "agora_chat_user_id_agoraID_key" ON "agora_chat_user_id"("agoraID");

-- CreateIndex
CREATE UNIQUE INDEX "server_admin_tokens_token_key" ON "server_admin_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "agora_video_block_ids_kick_id_key" ON "agora_video_block_ids"("kick_id");

-- CreateIndex
CREATE UNIQUE INDEX "agora_video_block_ids_block_hash_key" ON "agora_video_block_ids"("block_hash");

-- CreateIndex
CREATE UNIQUE INDEX "agora_chat_room_ids_room_id_key" ON "agora_chat_room_ids"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_code_key" ON "appointments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "shortened_tokens_code_key" ON "shortened_tokens"("code");

-- AddForeignKey
ALTER TABLE "rpm_models" ADD CONSTRAINT "rpm_models_userID_fkey" FOREIGN KEY ("userID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agora_chat_user_id" ADD CONSTRAINT "agora_chat_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp" ADD CONSTRAINT "otp_userID_fkey" FOREIGN KEY ("userID") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_appointments" ADD CONSTRAINT "user_appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_appointments" ADD CONSTRAINT "user_appointments_appoinment_id_fkey" FOREIGN KEY ("appoinment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
