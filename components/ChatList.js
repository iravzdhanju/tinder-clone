import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import ChatRow from "./ChatRow";
import tw from "tailwind-rn";
import { collection, onSnapshot, query, where } from "@firebase/firestore";
import useAuth from "../hooks/useAuth";
import { db } from "../firebase";

const DATA = [
  {
    id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
    image:
      "https://www.biography.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTc5OTk2ODUyMTMxNzM0ODcy/gettyimages-1229892983-square.jpg",
    firstName: "Sonny",
    lastName: "Sangha",
  },
  {
    id: "dsfsdfdsf-c1b1-46c2-aed5-3ad53abb28ba",
    image:
      "https://www.biography.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTc5OTk2ODUyMTMxNzM0ODcy/gettyimages-1229892983-square.jpg",
    firstName: "Sonny",
    lastName: "Sangha",
  },
  {
    id: "gthrhtrgv-c1b1-46c2-aed5-3ad53abb28ba",
    image:
      "https://www.biography.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTc5OTk2ODUyMTMxNzM0ODcy/gettyimages-1229892983-square.jpg",
    firstName: "Sonny",
    lastName: "Sangha",
  },
];

const ChatList = () => {
  const [matches, setMatches] = useState([]);

  const { user } = useAuth();

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "matches"),
          where("usersMatched", "array-contains", user.uid)
        ),
        (snapshot) =>
          setMatches(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          )
      ),
    [user]
  );

  // matches.forEach((match) => console.log(match));

  return matches.length > 0 ? (
    <FlatList
      style={tw("h-full")}
      data={matches}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatRow matchDetails={item} />}
    />
  ) : (
    <View style={tw("p-5")}>
      <Text style={tw("text-center text-lg")}>No matches at the moment 😢</Text>
    </View>
  );
};

export default ChatList;
