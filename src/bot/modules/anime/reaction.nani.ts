import { Reaction, DEFAULT_COOLDOWN } from 'bot/types';
import MessageHandler from 'bot/components/MessageHandler';
import { createWordRegex } from 'util/string/regex';

const regex = createWordRegex('nani');

const cmd: Reaction = {
  name: 'NANI??',
  description: 'Teleports behind you',
  cooldown: DEFAULT_COOLDOWN,
  test: (msg) => regex.test(msg.content),
  execute: async (msg) => {
    await msg.reply('_Teleports behind you_');
  },
};

MessageHandler.registerReaction(cmd);
