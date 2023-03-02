import { useNavigation } from "@react-navigation/core";
import React, { useLayoutEffect } from "react";
import { SafeAreaView } from "react-native";
import ChatList from "../components/ChatList";
import Header from "../components/Header";

const ChatScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <SafeAreaView>
      <Header title="Chat" />
      <ChatList />
    </SafeAreaView>
  );
};

export default ChatScreen;
