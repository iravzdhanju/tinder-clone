import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import tw from "tailwind-rn";
import useAuth from "../hooks/useAuth";
import { StatusBar } from "expo-status-bar";
import Swiper from "react-native-deck-swiper";
import { useNavigation } from "@react-navigation/core";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "@firebase/firestore";
import { db } from "../firebase";
import generateId from "../lib/generateId";

const DUMMY_DATA = [
  {
    firstName: "Sonny",
    lastName: "Sangha",
    occupation: "Software Developer",
    photoURL: "https://avatars.githubusercontent.com/u/24712956?v=4",
    age: 27,
  },
  {
    firstName: "Elon",
    lastName: "Musk",
    occupation: "Software Developer",
    photoURL:
      "https://www.biography.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTc5OTk2ODUyMTMxNzM0ODcy/gettyimages-1229892983-square.jpg",
    age: 40,
  },
  {
    firstName: "Sonny",
    lastName: "Sangha",
    occupation: "Software Developer",
    photoURL:
      "https://www.biography.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTc5OTk2ODUyMTMxNzM0ODcy/gettyimages-1229892983-square.jpg",
    age: 21,
  },
];

function Home() {
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const navigation = useNavigation();
  const swipeRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  useEffect(() => {
    let unsub;

    // THE ALGORITHM that makes it all work!
    const fetchCards = async () => {
      const passes = await getDocs(
        collection(db, "users", user.uid, "passes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const swipes = await getDocs(
        collection(db, "users", user.uid, "swipes")
      ).then((snapshot) => snapshot.docs.map((doc) => doc.id));

      const passedUserIds = passes.length > 0 ? passes : ["test"];
      const swipedUserIds = swipes.length > 0 ? swipes : ["test"];

      unsub = onSnapshot(
        query(
          collection(db, "users"),
          where("id", "not-in", [...passedUserIds, ...swipedUserIds])
        ),
        (snapshot) => {
          setProfiles(
            snapshot.docs
              .filter((doc) => doc.id !== user.uid)
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .sort((x, y) => x.timestamp - y.timestamp)
            // The sort is critical for ensuring new users go under the deck...
          );
        }
      );
    };

    fetchCards();

    return unsub;
  }, [db]);

  console.log(profiles);

  // user 1 swipes, enter to their swipes collection
  // user 2 swipes, check user 1's swipes collection + if match, add to matches collection with concact ID
  // messages pulls from matches collection

  useLayoutEffect(
    () =>
      onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (!snapshot.exists()) {
          navigation.navigate("Modal");
        }
      }),
    []
  );

  const swipeLeft = async (cardIndex) => {
    if (!profiles[cardIndex]) return;

    const userSwiped = profiles[cardIndex];

    console.log(`You swiped PASS on ${userSwiped.displayName}`);
    setDoc(doc(db, "users", user.uid, "passes", userSwiped.id), userSwiped);
  };

  // Matching Algorithm
  const swipeRight = async (cardIndex) => {
    if (!profiles[cardIndex]) return;

    // Get all relevant user data
    const userSwiped = profiles[cardIndex];
    const loggedInProfile = await (
      await getDoc(doc(db, "users", user.uid))
    ).data();

    // Check if user who you swiped has swiped on you...
    getDoc(doc(db, "users", userSwiped.id, "swipes", user.uid)).then(
      (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          // user has matched with this person...
          // create match...
          console.log(`Hooray, You MATCHED with ${userSwiped.displayName}`);
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );

          // Create a MATCH!
          setDoc(doc(db, "matches", generateId(user.uid, userSwiped.id)), {
            users: {
              [user.uid]: loggedInProfile,
              [userSwiped.id]: userSwiped,
            },
            usersMatched: [user.uid, userSwiped.id],
            timestamp: serverTimestamp(),
          });

          navigation.navigate("Match", {
            loggedInProfile,
            userSwiped,
          });
        } else {
          // User has swiped as first interaction between the two...
          console.log(
            `You swiped on ${userSwiped.displayName} (${userSwiped.job})`
          );
          setDoc(
            doc(db, "users", user.uid, "swipes", userSwiped.id),
            userSwiped
          );
        }
      }
    );
  };

  return (
    <SafeAreaView style={tw("flex-1 relative")}>
      <View style={tw("items-center relative")}>
        {user && (
          <TouchableOpacity
            onPress={logout}
            style={tw("absolute left-5 top-3")}
          >
            <Image
              style={tw("h-10 w-10 rounded-full")}
              source={{ uri: user.photoURL }}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
          <Image style={tw("h-14 w-14")} source={require("../logo.png")} />
        </TouchableOpacity>

        <TouchableOpacity style={tw("absolute right-5 top-3")}>
          <Ionicons
            onPress={() => navigation.navigate("Chat")}
            name="chatbubbles-sharp"
            size={30}
            color="#FF5864"
          />
        </TouchableOpacity>
      </View>

      <View style={tw("flex-1  -mt-6")}>
        {profiles && (
          <Swiper
            ref={swipeRef}
            containerStyle={{ backgroundColor: "transparent" }}
            cards={profiles}
            overlayLabels={{
              left: {
                title: "NOPE",
                style: {
                  label: {
                    textAlign: "right",
                    color: "red",
                  },
                },
              },
              right: {
                title: "MATCH",
                style: {
                  label: {
                    color: "#4DED30",
                  },
                },
              },
            }}
            renderCard={(card) => {
              return card ? (
                <View
                  key={card.id}
                  style={[
                    tw("relative bg-white h-3/4 rounded-xl"),
                    styles.cardShadow,
                  ]}
                >
                  <Image
                    style={tw("absolute top-0 h-full w-full rounded-xl ")}
                    source={{
                      uri: card?.photoURL,
                    }}
                  />
                  <View
                    style={tw(
                      "flex-row justify-between items-center absolute bottom-0 flex h-20 w-full text-center px-6 py-2 rounded-b-xl bg-white"
                    )}
                  >
                    <View>
                      <Text style={tw("text-lg font-bold")}>
                        {card?.displayName}
                      </Text>
                      <Text>{card?.job}</Text>
                    </View>
                    <Text style={tw("text-2xl font-bold")}>{card?.age}</Text>
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    tw(
                      "relative bg-white h-3/4 rounded-xl justify-center items-center"
                    ),
                    styles.cardShadow,
                  ]}
                >
                  <Text style={tw("font-bold pb-5")}>No more profiles</Text>

                  <Image
                    style={tw("h-20 w-full")}
                    height={100}
                    width={100}
                    source={{ uri: "https://links.papareact.com/6gb" }}
                  />
                </View>
              );
            }}
            animateCardOpacity
            verticalSwipe={false}
            onSwipedLeft={(cardIndex) => {
              console.log("Swipe PASS", cardIndex);
              swipeLeft(cardIndex);
            }}
            onSwipedRight={(cardIndex) => {
              console.log("Swipe MATCH", cardIndex);
              swipeRight(cardIndex);
            }}
            cardIndex={0}
            backgroundColor={"#4FD0E9"}
            stackSize={5}
          ></Swiper>
        )}
      </View>

      <View style={tw("flex flex-row justify-evenly")}>
        <TouchableOpacity
          onPress={() => swipeRef.current.swipeLeft()}
          style={[
            tw("items-center justify-center rounded-full w-16 h-16 bg-red-200"),
          ]}
        >
          <Entypo name="cross" size={24} color="red" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => swipeRef.current.swipeRight()}
          style={[
            tw(
              "items-center justify-center rounded-full w-16 h-16 bg-green-200"
            ),
          ]}
        >
          <AntDesign name="heart" size={24} color="green" />
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default Home;

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
});
