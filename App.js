import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import Meditation from "./src/Meditation.js";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "space-between", // This will ensure that title, input, and button are spaced out
    width: "100%",
  },
  titleContainer: {
    marginTop: 60, // Adjust this value as needed
    alignItems: "center",
  },
  inputContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  label: {
    fontSize: 18,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  input: {
    fontSize: 18,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10, // Adds space above and below the input fields
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: "80%", // Ensures input fields don't stretch too wide
  },
  buttonContainer: {
    marginBottom: 40, // Adjust this value as needed
    alignItems: "center",
  },
  button: {
    backgroundColor: "#6a95e1",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5,
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
  },
});
const secondsInMinute = 60;

export default function App() {
  const [bellIntervalMinutes, setBellIntervalMinutes] = useState(3);
  const [meditationTime, setMeditationTime] = useState(20); // Minutes
  const [meditationTimeRemaining, setMeditationTimeRemaining] = useState(null); // Seconds
  const [meditationInterval, setMeditationInterval] = useState(null);
  const [meditationSession, setMeditationSession] = useState(null);

  // Start meditation button will intantiate a Meditation object, and start it.
  // The Meditation object will schedule a bell sound every 3 minutes.
  const startMeditation = useCallback(
    async (meditationTime, bellIntervalMinutes) => {
      setMeditationTimeRemaining(meditationTime * secondsInMinute);

      setMeditationInterval(() =>
        setInterval(() => {
          setMeditationTimeRemaining((currentMeditationTime) => {
            if (currentMeditationTime === 1) {
              stopMeditation(true);
              return 0;
            }

            if (currentMeditationTime < 1) {
              return 0;
            }

            return currentMeditationTime - 1;
          });
        }, 1000),
      );

      try {
        await activateKeepAwakeAsync();
      } catch (e) {
        console.error(e);
      }

      const meditation = new Meditation({
        bellIntervalSeconds: bellIntervalMinutes * secondsInMinute,
      });
      await meditation.start();

      setMeditationSession(meditation);
    },
  );

  const stopMeditation = (finished = false) => {
    deactivateKeepAwake();

    setMeditationSession((meditationSession) => {
      meditationSession?.stop();

      if (finished) {
        meditationSession?.finalBell();
      }

      return null;
    });

    setMeditationInterval((meditationInterval) => {
      clearInterval(meditationInterval);
      return null;
    });

    setMeditationSession(null);
    setMeditationTimeRemaining(0);
  };

  const isMeditating = meditationTimeRemaining > 0;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("./assets/background.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Meditation</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bell Interval (seconds):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            onChangeText={(text) => setBellIntervalMinutes(Number(text))}
            value={bellIntervalMinutes.toString()}
            editable={!isMeditating}
          />

          <Text style={styles.label}>Meditation Time (minutes):</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setMeditationTime(Number(text))}
            value={meditationTime.toString()}
            keyboardType="numeric"
            editable={!isMeditating}
          />
        </View>

        <View style={styles.buttonContainer}>
          {isMeditating && ( // !!meditationTime &&
            <Text>{meditationTimeRemaining} seconds remaining.</Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              !isMeditating
                ? startMeditation(meditationTime, bellIntervalMinutes)
                : stopMeditation()
            }
          >
            <Text style={styles.buttonText}>
              {isMeditating ? "STOP MEDITATION" : "START MEDITATION"}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
