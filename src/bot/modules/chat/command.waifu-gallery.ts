import Bot from 'bot';
import { ArgumentType, Command } from 'bot/types';
import MessageHandler from 'bot/components/MessageHandler';
import { parseWaifuKey, getRandomPoseGallery, getPoseGallery, WaifuGalleryResult } from 'services/waifu-labs';
import { BotError, ArgumentError } from 'util/errors';
import { MessageAttachment } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';

const TILE_SIZE = 400;
const COLS = 8;
const ROWS = 4;
const PAD_LEFT = 10;
const PAD_BOTTOM = 50;
const TOTAL_POSES = ROWS * COLS;

const cmd: Command<ArgumentType.FullString> = {
  name: 'waifu-gallery',
  description: 'Gets set of poses for a waifu generated by `https://waifulabs.com/`',
  args: { name: 'id', description: 'Waifu id to retrieve poses for -- leave blank for random' },
  execute: async (msg, input) => {
    let waifuData: WaifuGalleryResult;
    if (!input) {
      Bot.logger.debug('Fetching waifu...');
      waifuData = await getRandomPoseGallery(TOTAL_POSES);
    } else {
      const { valid, params } = parseWaifuKey(input);
      if (!valid) {
        throw new ArgumentError('Bad id string');
      }
      Bot.logger.debug('Fetching waifu...');
      waifuData = await getPoseGallery(params, TOTAL_POSES);
    }
    if (!waifuData) {
      throw new BotError('Bad waifu data');
    }

    Bot.logger.debug('Drawing waifu...');
    const width = (TILE_SIZE + PAD_LEFT) * COLS;
    const height = (TILE_SIZE + PAD_BOTTOM) * ROWS;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'top';
    ctx.font = '32px sans';

    const promises = [];
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        const i = y * COLS + x;
        const url = waifuData.urls[i];
        const poseId = waifuData.poses[i];
        if (url) {
          promises.push(new Promise<void>(async (resolve, reject) => {
            try {
              const img = await loadImage(url);
              const xCoord = x * (TILE_SIZE + PAD_LEFT);
              const yCoord = y * (TILE_SIZE + PAD_BOTTOM);
              ctx.drawImage(img, xCoord, yCoord, TILE_SIZE, TILE_SIZE);
              ctx.fillText(`p:${poseId}`, xCoord + 5, yCoord + TILE_SIZE + 2);
              resolve();
            } catch (e) {
              reject(e);
            }
          }));
        }
      }
    }
    await Promise.all(promises);

    Bot.logger.debug('Uploading waifu...');
    const attachment = new MessageAttachment(canvas.toBuffer(), 'waifu-poses.png');
    const msgSendPromise = msg.reply(`||id: \`${waifuData.key}\`||`, { files: [attachment] });
    await msg.react('🇺');
    await msg.react('🇵');
    await msg.react('🇱');
    await msg.react('🇴');
    await msg.react('🇦');
    await msg.react('🇩');
    await msg.react('🇮');
    await msg.react('🇳');
    await msg.react('🇬');
    await msgSendPromise;
  },
};

MessageHandler.registerCommand(cmd);