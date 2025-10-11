import chalk from "chalk";
import { Client, EmbedBuilder, IntentsBitField, Events, AttachmentBuilder } from "discord.js";
import fetch from "node-fetch";
import ora from "ora";
import dotenv from 'dotenv';
import fs from "fs";
import path from "path";
dotenv.config();

console.log(chalk.bold.green("Runner bot Discord by " + chalk.cyan.underline("Rahaaa_")));
console.log(chalk.bold.blue("jangan lupa follow instagram " + chalk.cyan.underline("@rahawaeh_113")));
console.log(chalk.bold(chalk.red("Ingat! Jangan bagikan token Bot Discord-mu ke siapapun!\n")));
console.log(chalk.bold("Alat ini akan membantumu mengaktifkan " + chalk.cyan.underline("Bot Discord")));
console.log(chalk.bold("Jika kamu mengalami masalah, hubungi saya di Discord: " + chalk.cyan.underline("@rahawaeh_113") + "\n"));

// fungsi checkToken
export async function checkToken(value: string): Promise<boolean> {
  if (!value) return false;
  const res = await fetch("https://discord.com/api/v10/users/@me", {
    method: "GET",
    headers: {
      Authorization: `Bot ${value.toString()}`,
    },
  });
  return res.status === 200;
}

// fungsi utama
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
    intents: [IntentsBitField.Flags.Guilds],
  });

  try {
    await client.login(token);
  } catch (_e) {
    spinner.fail(chalk.bold("Terjadi kesalahan saat login ke Discord!"));
    process.exit(0);
  }

  const slashSpinner = ora(chalk.bold("Membuat interaksi perintah slash..."));

  client.once("ready", async (client) => {
    spinner.succeed(chalk.bold(`Berhasil login sebagai ${chalk.cyan.underline(client.user.tag)}!`));
    console.log(
      chalk.bold.green("✔") +
      chalk.bold(
        " Gunakan tautan ini untuk menambahkan bot ke servermu: " +
        chalk.cyan.italic.underline(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&scope=applications.commands%20bot\n`)
      )
    );

    await client.application?.commands.set([
      {
        name: "active", description: "Dapatkan Lencana Pengembang Aktif Discord"

      },
      {
        name: "ping", description: "Cek seberapa cepat bot ini respon 🛰️"
      }, {
        name: "roblox",
        description: "Cek informasi lengkap akun Roblox",
        options: [
          {
            name: "username",
            description: "Masukkan username Roblox",
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: "copy",
        description: "Menampilkan tombol copy untuk kode rahasia",
      }
    ]);

    slashSpinner.text = chalk.bold("Buka server Discord-mu dan gunakan perintah slash (/) di bot yang kamu buat");
    slashSpinner.start();
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (!interaction.isCommand()) return;

      // /active
      if (interaction.commandName === "active") {
        console.log(chalk.bold.green("Interaksi perintah /active diterima!"));
        const embed = new EmbedBuilder()
          .setAuthor({
            name: "Lencana Pengembang Aktif Discord",
            iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless",
          })
          .setTitle("Kamu berhasil menjalankan perintah slash!")
          .setColor("#34DB98")
          .setDescription(
            "- Buka *https://discord.com/developers/active-developer* dan klaim lencanamu\n - Proses verifikasi bisa memakan waktu hingga 24 jam, jadi bersabarlah sampai lencanamu muncul"
          )
          .setFooter({
            text: "Dibuat oleh @rahawaeh_113",
            iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless",
          });

        await interaction.reply({ embeds: [embed] });
      }

      // /ping
      if (interaction.commandName === "ping") {
        console.log(chalk.bold.yellow("Interaksi perintah /ping diterima!"));

        const start = Date.now();
        const msg = await interaction.reply({
          content: "⏳ Menghitung ping...",
          fetchReply: true,
        });
        const end = Date.now();
        const latency = end - start;

        const embed = new EmbedBuilder()
          .setColor("#00FF9C")
          .setTitle("🏓 Pong!")
          .setDescription(`📡 **Latency bot:** \`${latency}ms\`\n💻 **API latency:** \`${Math.round(interaction.client.ws.ping)}ms\``)
          .setFooter({
            text: "Dibuat dengan ❤️ oleh rahaaa_",
            iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless",
          });

        await interaction.editReply({ content: "", embeds: [embed] });
      }

      // /roblox
      if (interaction.commandName === "roblox") {
        const username = interaction.options.getString("username");
        await interaction.deferReply();

        try {
          const resUser = await fetch("https://users.roblox.com/v1/usernames/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernames: [username] }),
          });
          const userData = await resUser.json();
          const user = userData.data[0];
          if (!user) return await interaction.editReply(`❌ Username **${username}** tidak ditemukan.`);

          const resDetail = await fetch(`https://users.roblox.com/v1/users/${user.id}`);
          const detail = await resDetail.json();

          const resFriends = await fetch(`https://friends.roblox.com/v1/users/${user.id}/friends/count`);
          const { count: friendCount } = await resFriends.json();

          const resGames = await fetch(`https://games.roblox.com/v2/users/${user.id}/games?limit=3&sortOrder=Asc`);
          const gameData = await resGames.json();
          const topGame = gameData.data && gameData.data.length > 0 ? gameData.data[0] : null;

          const avatarURL = `https://www.roblox.com/headshot-thumbnail/image?userId=${user.id}&width=420&height=420&format=png`;
          const createdAt = new Date(detail.created).toLocaleString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          const embed = new EmbedBuilder()
            .setColor("#00A2FF")
            .setTitle(`👤 Profil Roblox: ${user.displayName}`)
            .setURL(`https://www.roblox.com/users/${user.id}/profile`)
            .setThumbnail(avatarURL)
            .addFields(
              { name: "🧩 Username", value: user.name, inline: true },
              { name: "🪪 User ID", value: `${user.id}`, inline: true },
              { name: "👥 Jumlah Teman", value: `${friendCount ?? 0}`, inline: true },
              { name: "🕐 Akun Dibuat", value: createdAt, inline: false },
              { name: "📜 Bio", value: detail.description || "_(kosong)_", inline: false },
            );

          if (topGame) {
            embed.addFields({
              name: "🎮 Game Buatan",
              value: `[${topGame.name}](https://www.roblox.com/games/${topGame.id}) — ${topGame.playing ?? 0} pemain aktif`,
              inline: false,
            });
          }

          embed.setFooter({
            text: "Data diambil dari API resmi Roblox",
            iconURL: "https://tr.rbxcdn.com/32b76c92f2f9f61e48ab67e528ce3f85/420/420/Image/Png",
          });

          await interaction.editReply({ content: "", embeds: [embed] });
          console.log(chalk.bold.green(`✅ Profil Roblox ${username} berhasil dikirim.`));

        } catch (err) {
          console.error(err);
          await interaction.editReply("⚠️ Terjadi kesalahan saat mengambil data Roblox. Coba lagi nanti!");
        }
      }

      // ===== Tambahan: /copy (membaca file kodeRahasia.txt dan mengirimnya, TIDAK mengeksekusi) =====
      if (interaction.commandName === "copy") {
        try {
          const filePath = path.resolve(process.cwd(), "kodeRahasia.txt"); // pastikan file ada di root project
          if (!fs.existsSync(filePath)) {
            await interaction.reply({ content: "File kodeRahasia.txt tidak ditemukan di folder project.", ephemeral: true });
            return;
          }

          const kode = fs.readFileSync(filePath, "utf-8");

          // Jangan pernah eval / jalankan isi kode — hanya kirim sebagai teks atau file
          if (kode.length <= 1900) {
            await interaction.reply({ content: `\`\`\`js\n${kode}\n\`\`\``, ephemeral: true });
          } else {
            const attachment = new AttachmentBuilder(Buffer.from(kode, "utf-8"), { name: "kodeRahasia.txt" });
            await interaction.reply({ content: "Ini code dan jan lupa follow @rahawaeh_113", files: [attachment], ephemeral: true });
          }
        } catch (err) {
          console.error("Error saat handling /copy:", err);
          try {
            await interaction.reply({ content: "Terjadi kesalahan saat mengambil file. Cek log di terminal.", ephemeral: true });
          } catch {}
        }
      }

    } catch (err) {
      console.error(err);
      process.exit(0);
    }
  });
}

// panggil fungsi utama
main();
