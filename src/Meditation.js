import { Audio } from "expo-av";

export default class Meditation {
  constructor({ bellIntervalSeconds }) {
    this.shortBellSound = new Audio.Sound();

    this.bellTimeout = null;
    this.bellIntervalSeconds = bellIntervalSeconds;
  }

  async start() {
    if (!!this.bellTimeout) {
      throw new Error("Meditation is already running. Stop it first.");
    }

    await this.shortBellSound.loadAsync(
      require("../assets/sounds/short-bell.mp3"),
    );
    await this.shortBellSound.playAsync();

    this.scheduleBell();
  }

  // Schedule next bell
  async scheduleBell() {
    // A small difference of +/-10 seconds to make the bell sound more natural
    const bellDelta = Math.floor(Math.random() * 20) - 10;
    const next = Math.abs(this.bellIntervalSeconds + bellDelta);

    console.log(`Scheduling next bell in ${next} seconds`);

    this.bellTimeout = setTimeout(async () => {
      await this.shortBellSound.replayAsync();

      clearTimeout(this.bellTimeout);

      this.scheduleBell();
    }, next * 1000);
  }

  async stop() {
    if (this.bellTimeout) {
      // Stop timeout interval
      clearTimeout(this.bellTimeout);
    }

    await this.shortBellSound.stopAsync();
  }

  async finalBell() {
    await this.shortBellSound.replayAsync();
    await delay({ seconds: 1 });
    await this.shortBellSound.replayAsync();
    await delay({ seconds: 1 });
    await this.shortBellSound.replayAsync();
  }
}

function delay({ seconds }) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}
