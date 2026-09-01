import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1788092922877 implements MigrationInterface {
  name = 'InitialSchema1788092922877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."otps_type_enum" AS ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET')`,
    );
    await queryRunner.query(
      `CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "type" "public"."otps_type_enum" NOT NULL, "codeHash" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "verifiedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_82b0deb105275568cdcef2823e" ON "otps"  ("userId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_82b0deb105275568cdcef2823e"`,
    );
    await queryRunner.query(`DROP TABLE "otps"`);
    await queryRunner.query(`DROP TYPE "public"."otps_type_enum"`);
  }
}
