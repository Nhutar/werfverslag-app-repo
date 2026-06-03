-- CreateTable
CREATE TABLE "werfverslag" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "datum" DATE NOT NULL,
    "aangemaakt_op" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "werfverslag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nok_punt" (
    "id" TEXT NOT NULL,
    "werfverslag_id" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "omschrijving" TEXT NOT NULL,
    "foto_url" TEXT,
    "verantwoordelijke_naam" TEXT NOT NULL,
    "verantwoordelijke_email" TEXT NOT NULL,
    "deadline" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "opgelost_door_naam" TEXT,
    "opgelost_op" TIMESTAMP(3),
    "aangemaakt_op" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nok_punt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_link_token" (
    "id" TEXT NOT NULL,
    "nok_punt_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "vervalt_op" TIMESTAMP(3) NOT NULL,
    "aangemaakt_op" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "magic_link_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "magic_link_token_token_key" ON "magic_link_token"("token");

-- AddForeignKey
ALTER TABLE "nok_punt" ADD CONSTRAINT "nok_punt_werfverslag_id_fkey" FOREIGN KEY ("werfverslag_id") REFERENCES "werfverslag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_link_token" ADD CONSTRAINT "magic_link_token_nok_punt_id_fkey" FOREIGN KEY ("nok_punt_id") REFERENCES "nok_punt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
