import * as readline from "readline";

import { Duration, Size, channels } from "@mantle-cloud/channels-node";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (input) => resolve(input));
  });
}

const makeId = function (length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const main = async () => {
  const usersChannel = await channels().connect("users", Size.Global);
  const cardsChannel = await channels().connect("cards", Size.Global);

  usersChannel.catch(
    (drops) => {
      console.log("USERS:", drops);
    },
    {
      filter: {},
    }
  );

  cardsChannel.catch(
    (drops) => {
      console.log("CARDS:", drops);
    },
    {
      filter: { "data.type": "task" },
    }
  );

  await usersChannel.drop(Duration.Connection, { user: makeId(5) });

  let quit = false;
  while (!quit) {
    const result = await ask(">");
    const ch = result.toUpperCase().substring(0, 1);

    if (ch === "Q") {
      quit = true;
    }

    if (ch === "A") {
      await cardsChannel.drop(Duration.Forever, { type: "habit" });
    }
  }

  channel.disconnect();

  console.log("Quit");
};

void main();
