    await queryRunner.query(`
      INSERT INTO app_users ("username", "password_hash", "created_at", "updated_at")
        VALUES ('admin', '', current_timestamp, current_timestamp)
      ON CONFLICT (username) DO NOTHING;
      `);
