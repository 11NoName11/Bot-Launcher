import chalk from "chalk";
import { Client, EmbedBuilder, IntentsBitField, MessageFlags, Events } from "discord.js";
import fetch from "node-fetch";
import ora from "ora";
import prompts from "prompts";
import dotenv from 'dotenv';
dotenv.config(); // pastikan ini di paling atas

console.log(chalk.bold.green("Runner bot Discord by Rahaaa_"));
console.log(chalk.bold.blue("jangan lupa follow instagram @rahawaeh_113"));
console.log(chalk.bold(chalk.red("Ingat! Jangan bagikan token Bot Discord-mu ke siapapun!\n")));

console.log(chalk.bold("Alat ini akan membantumu mengaktifkan " + chalk.cyan.underline("Bot Discord")));
console.log(chalk.bold("Jika kamu mengalami masalah, hubungi saya di Discord: " + chalk.cyan.underline("@rahawaeh_113") + "\n"));

// fungsi checkToken tetap sama, tidak diubah
export async function checkToken(value: string): Promise<boolean> {
  if (!value) return false;

  const res = await fetch("https://discord.com/api/v10/users/@me", {
    method: "GET",
    headers: {
      Authorization: `Bot ${value.toString()}`,
    },
  });
  return res.status !== 200 ? false : true;
}

// fungsi utama supaya bisa pakai await
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
    spinner.fail(chalk.bold("Terjadi kesalahan saat login ke Discord! GG, ada yang error!"));
    process.exit(0);
  }

  const slashSpinner = ora(chalk.bold("Membuat interaksi perintah slash..."));

  client.on("ready", async (client) => {
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
        name: "active",
        description: "Dapatkan Lencana Pengembang Aktif Discord",
      },
    ]);

    slashSpinner.text = chalk.bold("Buka Server Discord-mu (tempat bot ditambahkan) dan gunakan perintah slash " + chalk.cyan.bold("/active"));
    slashSpinner.start();
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (!interaction.isCommand()) return;

      if (interaction.commandName === "active") {
        console.log(chalk.bold.green("Interaksi perintah slash diterima!"));
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
            text: "Dibuat oleh @majonez.exe",
            iconURL: "https://cdn.discordapp.com/emojis/1040325165512396830.webp?size=64&quality=lossless",
          });
        slashSpinner.succeed(
          chalk.bold(
            "Kamu berhasil menjalankan perintah slash! Ikuti instruksi di pesan Discord yang kamu terima. Sekarang kamu bisa menutup aplikasi ini dengan menekan Ctrl + C"
          )
        );

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
    } catch {
      slashSpinner.fail(
        chalk.bold.red("Terjadi kesalahan saat membuat interaksi perintah slash! Kadang ini bisa terjadi, tapi jangan khawatir - cukup keluarkan bot dari server dan jalankan aplikasi ini lagi!")
      );
      process.exit(0);
    }
  });
}

// panggil fungsi utama
main();
