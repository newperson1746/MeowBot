import dotenv from 'dotenv-extended';
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from 'discord.js';
import { createStdEmbed } from '../utils/embeds';
import { sqlGetSohoPerson, sqlRemoveSohoPeople, sqlGetSohoStreak, sqlWriteSohoStreak } from '../utils/os_native_glue';

export default class SohoPplRm {
  readonly command = new SlashCommandBuilder()
    .setName('out')
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
  
    let stats;
    sqlGetSohoPerson(member.id.toString(), (error, results, fields) => {
      if (error) {
        console.log('Error in Soho people get query:', error);
      } else {
        stats = results[0];
      }
    });

      sqlRemoveSohoPeople(member.id.toString(), (error, result) => {
        if (error) {
          console.log('Error in SoHo people remove query:', error);
          stdembed.setDescription(`Error in sqlRemoveSohoPeople: ${error}`);
          interaction.followUp({
            embeds: [stdembed],
            ephemeral: false
          })
        } else {
          if (result.affectedRows === 0) {
            public_success.setDescription(
              `${interaction.member.user}, you weren’t on the SoHo people list.`
            );
          } else {
            const timeIn = stats.time;
            const timeOut = Math.floor(Date.now() / 1000)
            let totaltime;
            sqlGetSohoStreak(member.id.toString(), (error, results, fields) => {
              if (error) {
                console.log('Error in Soho streaks get query:', error);
              } else {
                if (results[0].length === 0) {
                  // The user does not have a streak yet
                  totaltime = 0;
                } else {
                  totaltime = results[0].totaltime;
                }
              }
            });
        
            public_success.setDescription(
              `${interaction.member.user}, successfully removed yourself from the SoHo people list\n\n` +
              `You entered Soho at <t:${timeIn}:f> \n` +
              `You left Soho at <t:${timeOut}:f> \n\n` +
              `Time elapsed this visit: <t:${timeOut - timeIn}:R>` +
              `Soho streak (total) time: <t:${totaltime}:R>`
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
