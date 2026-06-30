-- CreateEnum
CREATE TYPE "Plano" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "Cultura" AS ENUM ('SOJA', 'MILHO', 'CAFE', 'ALGODAO', 'CANA', 'ARROZ', 'FEIJAO', 'TRIGO', 'OUTROS');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('GEADA', 'SECA', 'CHUVA_INTENSA', 'VENTO_FORTE', 'ENCHENTE', 'QUALIDADE_AR_RUIM', 'UV_ALTO');

-- CreateEnum
CREATE TYPE "SeveridadeAlerta" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "plano" "Plano" NOT NULL DEFAULT 'FREE',
    "planoAtéEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "cultura" "Cultura" NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dados_climaticos_diarios" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "areaId" TEXT NOT NULL,
    "tempMax" DOUBLE PRECISION,
    "tempMin" DOUBLE PRECISION,
    "precipitacao" DOUBLE PRECISION,
    "probPrecipitacao" INTEGER,
    "ventoMax" DOUBLE PRECISION,
    "evapotranspiracao" DOUBLE PRECISION,
    "tempSolo0cm" DOUBLE PRECISION,
    "tempSolo6cm" DOUBLE PRECISION,
    "tempSolo18cm" DOUBLE PRECISION,
    "umidadeSolo01" DOUBLE PRECISION,
    "umidadeSolo13" DOUBLE PRECISION,
    "umidadeSolo39" DOUBLE PRECISION,
    "radiacaoSolar" DOUBLE PRECISION,
    "weatherCode" INTEGER,
    "ehHistorico" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dados_climaticos_diarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qualidade_ar_diarios" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "areaId" TEXT NOT NULL,
    "pm10" DOUBLE PRECISION,
    "pm25" DOUBLE PRECISION,
    "dust" DOUBLE PRECISION,
    "co" DOUBLE PRECISION,
    "no2" DOUBLE PRECISION,
    "o3" DOUBLE PRECISION,
    "so2" DOUBLE PRECISION,
    "uvIndexMax" DOUBLE PRECISION,
    "usAqi" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qualidade_ar_diarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dados_enchente_diarios" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "areaId" TEXT NOT NULL,
    "descargaRio" DOUBLE PRECISION,
    "descargaRioMax" DOUBLE PRECISION,
    "descargaRioMediana" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dados_enchente_diarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAlerta" NOT NULL,
    "severidade" "SeveridadeAlerta" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "dataEvento" DATE NOT NULL,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "lidoEm" TIMESTAMP(3),
    "enviado" BOOLEAN NOT NULL DEFAULT false,
    "enviadoEm" TIMESTAMP(3),
    "areaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "areas_userId_idx" ON "areas"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dados_climaticos_diarios_areaId_data_key" ON "dados_climaticos_diarios"("areaId", "data");

-- CreateIndex
CREATE INDEX "dados_climaticos_diarios_areaId_data_idx" ON "dados_climaticos_diarios"("areaId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "qualidade_ar_diarios_areaId_data_key" ON "qualidade_ar_diarios"("areaId", "data");

-- CreateIndex
CREATE INDEX "qualidade_ar_diarios_areaId_data_idx" ON "qualidade_ar_diarios"("areaId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "dados_enchente_diarios_areaId_data_key" ON "dados_enchente_diarios"("areaId", "data");

-- CreateIndex
CREATE INDEX "dados_enchente_diarios_areaId_data_idx" ON "dados_enchente_diarios"("areaId", "data");

-- CreateIndex
CREATE INDEX "alertas_userId_lido_idx" ON "alertas"("userId", "lido");

-- CreateIndex
CREATE INDEX "alertas_areaId_dataEvento_idx" ON "alertas"("areaId", "dataEvento");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dados_climaticos_diarios" ADD CONSTRAINT "dados_climaticos_diarios_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qualidade_ar_diarios" ADD CONSTRAINT "qualidade_ar_diarios_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dados_enchente_diarios" ADD CONSTRAINT "dados_enchente_diarios_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
