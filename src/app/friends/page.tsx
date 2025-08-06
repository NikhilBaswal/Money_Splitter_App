"use client";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  List,
  ListItem,
  useToast,
} from "@chakra-ui/react";

import React, { useState, useEffect } from "react";

// Backend API base URL (Render)
const API_URL = "https://money-splitter-app-lu6r.onrender.com";

export default function FriendsPage() {
  const [friends, setFriends] = useState<string[]>([]);
  const [newFriend, setNewFriend] = useState("");
  const toast = useToast();

  // Fetch friends from backend (example: userId = 1)
  const fetchFriends = async () => {
    try {
      const res = await fetch(`${API_URL}/users/1/friends`);
      if (!res.ok) throw new Error("Failed to fetch friends");
      const data = await res.json();
      setFriends(data.map((f: any) => f.name));
    } catch {
      setFriends([]);
    }
  };

  // Add friend via backend (example: userId = 1)
  const handleAddFriend = async () => {
    if (!newFriend) return;
    if (friends.includes(newFriend)) {
      toast({ title: "Friend already added.", status: "warning" });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/1/friends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFriend }),
      });
      if (!res.ok) throw new Error("Failed to add friend");
      setFriends([...friends, newFriend]);
      setNewFriend("");
      toast({ title: "Friend added!", status: "success" });
    } catch {
      toast({ title: "Failed to add friend", status: "error" });
    }
  };

  // Fetch friends on mount
  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <Box
      maxW="md"
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Add Friend</FormLabel>
          <Input
            value={newFriend}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewFriend(e.target.value)
            }
            placeholder="Enter username"
          />
          <Button mt={2} colorScheme="teal" onClick={handleAddFriend}>
            Add Friend
          </Button>
        </FormControl>
        <Box>
          <FormLabel>Friend List</FormLabel>
          <List spacing={2}>
            {friends.map((friend: string) => (
              <ListItem key={friend}>{friend}</ListItem>
            ))}
          </List>
        </Box>
      </VStack>
    </Box>
  );
}
