import dotenv from 'dotenv-extended';
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from 'discord.js';
import { createStdEmbed } from '../utils/embeds';
import { sqlRemoveSohoPeople } from '../utils/os_native_glue';

export default class SohoPplRm {
  readonly command = new SlashCommandBuilder()
    .setName('sohopplrm')
    .setDescription('Remove yourself from the soho people list')
    .setDefaultMemberPermissions(0n) // disabled until roles are granted

  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;

    const public_success = createStdEmbed(interaction.client);
    public_success.setTitle('SoHo People Remove');
    public_success.setDescription(
      
     `${interaction.member.user}, successfully removed yourself from the soho people list`
    );

    const stdembed = createStdEmbed(interaction.client);
    stdembed.setTitle('SoHo People Remove');
    stdembed.setDescription(`Please wait...`);
    interaction.reply({
      embeds: [stdembed],
      ephemeral: true
    })
    .then( () => {
      sqlRemoveSohoPeople(member.id.toString(), (error, results, fields) => {
        if (error) {
          console.log('Error in SoHo people remove query:', error);
          stdembed.setDescription(`Error in sqlRemoveSohoPeople: ${error}`);
          interaction.followUp({
            embeds: [stdembed],
            ephemeral: false
          })
        } else {
          if (results.affectedRows === 0) {
            public_success.setDescription(
              `${interaction.member.user}, you weren’t on the SoHo people list.`
            );
          } else {
            public_success.setDescription(
              `${interaction.member.user}, successfully removed yourself from the SoHo people list`
            );
          }
        }

        interaction.followUp({
          embeds: [public_success],
        });

      })
    })
  }
}
