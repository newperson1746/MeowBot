import dotenv from 'dotenv-extended';
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from 'discord.js';
import { createStdEmbed } from '../utils/embeds';
import { executeCommandEmbed } from '../utils/os_native_glue';
import { parseArgsStringToArgv } from 'string-argv';

dotenv.load();

export default class Exec {
  readonly command: SlashCommand = new SlashCommandBuilder()
    .setName('exec')
    .setDescription('Execute a Linux command')
    .setDefaultMemberPermissions(0) // “disabled by default”
    .addStringOption((o) =>
      o.setName('binary')
        .setDescription('Path to executable')
        .setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('args')
        .setDescription('Arguments for the command'),
    );

  async execute(interaction: ChatInputCommandInteraction) {
    const binary = interaction.options.getString('binary', true);
    const argsRaw = interaction.options.getString('args') ?? '';

    const args = parseArgsStringToArgv(argsRaw);

    // temporary whitelist
    if ( interaction.member.id != process.env.OWNER_ID ) {
      const embed = createStdEmbed();
      embed.setTitle('Execute command');
      embed.setDescription(`${interaction.member.id} is not allowed to run this command!`);
      return interaction.reply({ embeds: [embed], ephemeral: false });
    }

    executeCommandEmbed(binary, args, interaction);
  
  }
}
