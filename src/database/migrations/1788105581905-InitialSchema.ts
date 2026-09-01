import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1788105581905 implements MigrationInterface {
  name = 'InitialSchema1788105581905';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "authorId" uuid NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c5a322ad12a7bf95460c958e80" ON "posts"  ("authorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_65d5fbf616c25e628a12898e68" ON "posts"  ("authorId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "postId" uuid NOT NULL, "authorId" uuid NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e44ddaaa6d058cb4092f83ad61" ON "comments"  ("postId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4548cc4a409b8651ec75f70e28" ON "comments"  ("authorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e036a0f1b41b77ea5d9675eb93" ON "comments"  ("authorId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a4367f08021b501ba78f98ae01" ON "comments"  ("postId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."likes_targettype_enum" AS ENUM('POST', 'COMMENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "targetId" uuid NOT NULL, "targetType" "public"."likes_targettype_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f7fdba1888c7acc68855dd33a4" ON "likes"  ("targetId", "targetType") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e8ca69742fd55fce9524440bf6" ON "likes"  ("userId", "targetId", "targetType") `,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8ca69742fd55fce9524440bf6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f7fdba1888c7acc68855dd33a4"`,
    );
    await queryRunner.query(`DROP TABLE "likes"`);
    await queryRunner.query(`DROP TYPE "public"."likes_targettype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4367f08021b501ba78f98ae01"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e036a0f1b41b77ea5d9675eb93"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4548cc4a409b8651ec75f70e28"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e44ddaaa6d058cb4092f83ad61"`,
    );
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_65d5fbf616c25e628a12898e68"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c5a322ad12a7bf95460c958e80"`,
    );
    await queryRunner.query(`DROP TABLE "posts"`);
  }
}
