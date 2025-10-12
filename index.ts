import chalk from "chalk";
import { Client, IntentsBitField, Events, EmbedBuilder } from "discord.js";
import ora from "ora";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { handleCommands, registerCommands } from "./commands.js";

dotenv.config();

console.log(chalk.bold.green("Runner bot Discord by " + chalk.cyan.underline("Rahaaa_")));
console.log(chalk.bold.blue("jangan lupa follow instagram " + chalk.cyan.underline("@rahawaeh_113")));
console.log(chalk.bold(chalk.red("Ingat! Jangan bagikan token Bot Discord-mu ke siapapun!\n")));
console.log(chalk.bold("Alat ini akan membantumu mengaktifkan " + chalk.cyan.underline("Bot Discord")));
console.log(chalk.bold("Jika kamu mengalami masalah, hubungi saya di Discord: ") + chalk.cyan.underline("https://discord.com/users/1011588306724737105 "));
console.log(chalk.bold("my name in discord : ") + chalk.cyan.underline("@rahawaeh_113"));

async function checkToken(value) {
  if (!value) return false;
  const res = await fetch("https://discord.com/api/v10/users/@me", {
    method: "GET",
    headers: { Authorization: `Bot ${value}` },
  });
  return res.status === 200;
}

async function main() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.error("✖ Token tidak ditemukan! Pastikan sudah buat file .env");
    process.exit(1);
  }

  const isValid = await checkToken(token);
  if (!isValid) {
    console.log("✖ Token Bot Discord tidak valid!");
    process.exit(0);
  }

  console.log();
  const spinner = ora(chalk.bold("Menjalankan Bot Discord")).start();

  const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
    ],
  });

  try {
    await client.login(token);
  } catch {
    spinner.fail(chalk.bold("Terjadi kesalahan saat login ke Discord!"));
    process.exit(0);
  }

  client.once("ready", async (client) => {
    spinner.succeed(chalk.bold(`Berhasil login sebagai ${chalk.cyan.underline(client.user.tag)}!`));
    console.log(
      chalk.bold.green("✔") +
        chalk.bold(
          " Gunakan tautan ini untuk menambahkan bot ke servermu: " +
            chalk.cyan.italic.underline(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands%20bot\n`)
        )
    );

    await registerCommands(client);
    ora(chalk.bold("Buka server Discord-mu dan gunakan perintah slash (/) di bot yang kamu buat")).start();

    // 🟢 Status bot
    client.user.setPresence({
      activities: [
        {
          name: "| menjaga server rahaaa_🌙", // teks status
          type: 0, // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching, 5 = Competing
        },
      ],
      status: "online", // bisa "online", "idle", "dnd", atau "invisible"
    });

    console.log(chalk.cyan("🌙 Status bot sudah diatur!"));
  });

  // === 🎉 Pesan Selamat Datang (DM + Channel)
  client.on("guildMemberAdd", async (member) => {

    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(`👋 Selamat Datang di ${member.guild.name}!`)
      .setDescription(
        `Halo ${member.user}, senang banget kamu udah join!\n\n🌟 Kami harap kamu betah di sini!\n\n📜 Jangan lupa baca peraturan server biar makin seru dan aman buat semua 😄`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Selamat datang, ${member.user.username}! • ${member.guild.memberCount} anggota sekarang`,
        iconURL: member.guild.iconURL({ dynamic: true }),
      })
      .setTimestamp();

    // Kirim DM
    try {
      await member.send({ embeds: [welcomeEmbed] });
      console.log(chalk.green(`✔ DM selamat datang dikirim ke ${member.user.tag}`));
    } catch (err) {
      console.log(chalk.red(`✖ Gagal kirim DM ke ${member.user.tag}: ${err.message}`));
    }

    // Kirim ke channel #welcome
    const welcomeChannel =
      member.guild.channels.cache.find(
        (ch) => ch.name.toLowerCase() === "welcome" && ch.isTextBased()
      ) || null;

    if (welcomeChannel) {
      welcomeChannel.send({
        content: `🎉 Selamat datang ${member.user} di server **${member.guild.name}**!`,
        embeds: [welcomeEmbed],
      });
    }
  });

  // === 👋 Pesan Selamat Tinggal (Goodbye)
  client.on("guildMemberRemove", async (member) => {

    const goodbyeEmbed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle(`😢 ${member.user.username} telah keluar dari server`)
      .setDescription(`Kami harap kamu sukses di luar sana! 🚀`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `${member.guild.memberCount} anggota tersisa`,
        iconURL: member.guild.iconURL({ dynamic: true }),
      })
      .setTimestamp();

    // Kirim ke channel #goodbye
    const goodbyeChannel =
      member.guild.channels.cache.find(
        (ch) => ch.name.toLowerCase() === "goodbye" && ch.isTextBased()
      ) || null;

    if (goodbyeChannel) {
      goodbyeChannel.send({
        content: `👋 Selamat tinggal **${member.user.username}**!`,
        embeds: [goodbyeEmbed],
      });
    }

    console.log(chalk.yellow(`⚠ ${member.user.tag} keluar dari server ${member.guild.name}`));
  });

  client.on("guildMemberRemove", async (member) => {
    try {
      const goodbyeEmbed = new EmbedBuilder()
        .setColor(0xff5555) // warna merah lembut
        .setTitle(`😢 Selamat Tinggal, ${member.user.username}!`)
        .setDescription(
          `👋 ${member.user} telah meninggalkan server **${member.guild.name}**.\n` +
            `Semoga sukses di mana pun kamu berada 💫`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `${member.guild.name} • Sekarang tersisa ${member.guild.memberCount} anggota`,
          iconURL: member.guild.iconURL({ dynamic: true }) || undefined,
        })
        .setTimestamp();

      const channel = member.guild.channels.cache.find(
        (ch) => ch.name === "goodbye" && ch.isTextBased()
      );

      if (channel) {
        await channel.send({ embeds: [goodbyeEmbed] });
        console.log(`👋 Pesan goodbye dikirim untuk ${member.user.tag}`);
      } else {
        console.log("⚠️ Channel #goodbye tidak ditemukan!");
      }
    } catch (error) {
      console.log(`❌ Gagal mengirim pesan goodbye: ${error.message}`);
    }
  });
}

main();

process.on("SIGINT", () => {
  console.log("\n🛑 Menutup bot Discord dengan aman...");
  process.exit(0);
});
