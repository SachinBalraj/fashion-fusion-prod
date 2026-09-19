const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Settings = require('../models/Settings');

const promptHidden = (query) => {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    stdout.write(query);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let input = '';
    const onData = (char) => {
      if (char === '\u0003') {
        stdout.write('\n');
        process.exit(130);
      }
      if (char === '\r' || char === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        stdout.write('\n');
        resolve(input);
        return;
      }
      if (char === '\u007f' || char === '\b') {
        input = input.slice(0, -1);
        stdout.write('\b \b');
        return;
      }
      input += char;
      stdout.write('*');
    };

    stdin.on('data', onData);
  });
};

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI environment variable is required');
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL || 'admin@fashionsfusion.com';

  let password;
  if (process.env.ADMIN_PASSWORD) {
    password = process.env.ADMIN_PASSWORD;
    console.warn('Using ADMIN_PASSWORD from environment.');
  } else {
    password = await promptHidden('Enter new admin password: ');
    const confirm = await promptHidden('Confirm new admin password: ');
    if (password !== confirm) {
      console.error('Passwords do not match. No changes made.');
      process.exit(1);
    }
  }

  if (!password || password.length < 6) {
    console.error('Password must be at least 6 characters. No changes made.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  let user = await User.findOne({ email });
  if (user) {
    user.password = password;
    await user.save();
    console.log(`Admin password updated for ${email}`);
  } else {
    await User.create({ name: 'Admin', email, password, role: 'admin', phone: '' });
    console.log(`Admin created with new password for ${email}`);
  }

  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({});
    console.log('Default settings created');
  }

  mongoose.disconnect();
  console.log('Disconnected. Password is stored as a bcrypt hash only.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});