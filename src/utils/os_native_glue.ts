// MySQL, crypto
import { pool, poolmc } from './mysql_init';
import { QueryError, FieldPacket } from 'mysql2';
import { ChildProcessWithoutNullStreams, spawnSync, SpawnSyncReturns } from 'child_process';
import { createStdEmbed } from './embeds'
import { ChatInputCommandInteraction, Interaction } from 'discord.js';

function executeCommand(command: string, args: string[]): SpawnSyncReturns<Buffer> {
  const result = spawnSync(command, args);
  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();
  const error = result.error;
  const status = result.status;

  if (error) {
    console.log(error);
  } else {
    console.log(`stdout: ${stdout}; stderr: ${stderr}`);
  }
  return result;
};

function executeCommandEmbed(command: string, args: string[],
  interaction: ChatInputCommandInteraction): boolean | SpawnSyncReturns<Buffer> {
  
  const result = spawnSync(command, args);

  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();
  const error = result.error;
  const status = result.status;
  const stdembed = createStdEmbed(interaction.client);

  if (error) {
    console.error(error, stdout, stderr);
    stdembed.setDescription(`Error spawnSync ${error}`);
    interaction.reply({
      embeds: [stdembed],
      ephemeral: false
    });
    return false;
  } else if (status != 0) {
    console.log(stderr, stdout);
    stdembed.setTitle(`Exec: \`${command}\` returned non-zero`);
    stdembed.setDescription(`stdout:\n\`${stdout}\`\nstderr:\n\`${stderr}\``);
    interaction.reply({
      embeds: [stdembed],
      ephemeral: false
    });
  } else {
    stdembed.setTitle(`Exec: \`${command}\` success!`);
    stdembed.setDescription(`stdout:\n\`${stdout}\`\nstderr:\n\`${stderr}\``);
    interaction.reply({
      embeds: [stdembed],
      ephemeral: false
    });
  }

  return result;
};

function sqlGetLinuxUser(discordid: string, callback: (error: QueryError | null, results: any[], fields: FieldPacket[]) => void) {
    pool.query('SELECT linuxuser FROM linkedaccounts WHERE discordid = ?', [discordid],
    (error: QueryError | null, results: any[], fields: FieldPacket[]) => {
        if (error) {
            console.log(error);
            callback(error, [], []);
        } else {
            console.log(results);
            callback(null, results, fields);
        }
    });
}

function sqlWriteLinuxUser(discordid: string, linuxuser: string, linuxuid: number, callback: (error: any, result: string | null) => void) {
  pool.query(
    'INSERT INTO linkedaccounts (discordid, linuxuser, linuxuid, pwlastchanged) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE pwlastchanged = NOW()',
    [discordid, linuxuser, linuxuid],
    (error: QueryError | null, results: any, fields: FieldPacket[]) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, 'Insert successful');
      }
    }
  );
}

function sqlGetMcUuid(discordid: string, callback: (error: QueryError | null, results: any[], fields: FieldPacket[]) => void) {
    poolmc.query('SELECT uuid FROM discordsrv_accounts WHERE discord = ?', [discordid],
    (error: QueryError | null, results: any[], fields: FieldPacket[]) => {
        if (error) {
            console.log(error);
            callback(error, [], []);
        } else {
            console.log(results);
            callback(null, results, fields);
        }
    });
}

function sqlWriteMcUuid(discordid: string, mcuuid: number, callback: (error: any, result: string | null) => void) {
  poolmc.query(
    'INSERT INTO discordsrv_accounts (discord, uuid) VALUES (?, ?) ON DUPLICATE KEY UPDATE uuid = ?',
    [discordid, mcuuid, mcuuid],
    (error: QueryError | null, results: any, fields: FieldPacket[]) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, 'Insert successful');
      }
    }
  );
}

function sqlGetSohoPeople(callback: (error: QueryError | null, results: any[], fields: FieldPacket[]) => void) {
    poolsoho.query('SELECT discordid FROM sohopeople',
    (error: QueryError | null, results: any[], fields: FieldPacket[]) => {
        if (error) {
            console.log(error);
            callback(error, [], []);
        } else {
            console.log(results);
            callback(null, results, fields);
        }
    });
}

function sqlWriteSohoPeople(discordid: string, mcuuid: number, callback: (error: any, result: string | null) => void) {
  poolsoho.query(
    'INSERT INTO sohopeople (discordid, time) VALUES (?, UNIX_TIMESTAMP()) ON DUPLICATE KEY UPDATE time = UNIX_TIMESTAMP()',
    [discordid],
    (error: QueryError | null, results: any, fields: FieldPacket[]) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, 'Insert successful');
      }
    }
  );
}

function sqlGetSoHoStatus(callback: (error: QueryError | null, results: any[], fields: FieldPacket[]) => void) {
    pool.query('SELECT * FROM sohostatus WHERE id = 1',
    (error: QueryError | null, results: any[], fields: FieldPacket[]) => {
        if (error) {
            console.log(error);
            callback(error, [], []);
        } else {
            console.log(results);
            callback(null, results, fields);
        }
    });
}

function sqlWriteSoHoStatus(discordid: string, status: string, callback: (error: any, result: string | null) => void) {
  pool.query(
    'UPDATE sohostatus SET status = ?, discordid = ? WHERE id = 1',
    [status, discordid],
    (error: QueryError | null, results: any, fields: FieldPacket[]) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, 'Update successful');
      }
    }
  );
}

export { executeCommand, executeCommandEmbed, sqlGetSohoPeople, sqlWriteSohoPeople,
sqlGetLinuxUser, sqlWriteLinuxUser, sqlGetMcUuid, sqlWriteMcUuid, sqlGetSoHoStatus, sqlWriteSoHoStatus };
