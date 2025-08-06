"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Flex,
  Spacer,
  Heading,
  IconButton,
  Select,
  Text,
  Divider,
  Stack,
} from "@chakra-ui/react";
import { FiLogOut } from "react-icons/fi";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [amount, setAmount] = useState("");
  const [product, setProduct] = useState("");
  const [place, setPlace] = useState("");
  const [remarks, setRemarks] = useState("");
  const [date, setDate] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [friendName, setFriendName] = useState("");
  const [friends, setFriends] = useState<{ id: number; name: string }[]>([]);

  const [currentUser, setCurrentUser] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Backend API base URL (Render)
  const API_URL = "https://money-splitter-app-lu6r.onrender.com";
  const toast = useToast();
  const router = useRouter();

  const filteredExpenses = expenses.filter((exp) => {
    const search = searchTerm.toLowerCase();
    return (
      exp.product?.toLowerCase().includes(search) ||
      exp.place?.toLowerCase().includes(search) ||
      exp.remarks?.toLowerCase().includes(search) ||
      (exp.date && exp.date.toLowerCase().includes(search))
    );
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      const user = localStorage.getItem("currentUser");
      setCurrentUser(user ? parseInt(user) : null);
    }
  }, [router]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (currentUser) {
        try {
          const res = await fetch(`${API_URL}/expenses/user/${currentUser}`);
          if (!res.ok) throw new Error("Failed to fetch expenses");
          const data = await res.json();
          setExpenses(data);
        } catch {
          setExpenses([]);
        }
      }
    };
    fetchExpenses();
  }, [currentUser]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (currentUser) {
        try {
          const res = await fetch(`${API_URL}/users/${currentUser}/friends`);
          if (!res.ok) throw new Error("Failed to fetch friends");
          const data = await res.json();
          setFriends(data.map((f: any) => ({ id: f.id, name: f.name })));
        } catch {
          setFriends([]);
        }
      }
    };
    fetchFriends();
  }, [currentUser]);

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedUsers(options);
  };

  const handleAddFriend = async () => {
    if (!friendName.trim()) {
      toast({ title: "Enter a friend's name.", status: "warning" });
      return;
    }
    if (friends.some((f) => f.name === friendName.trim())) {
      toast({ title: "Friend already added.", status: "info" });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/${currentUser}/friends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: friendName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add friend");
      const newFriend = await res.json();
      setFriends([...friends, { id: newFriend.id, name: newFriend.name }]);
      setFriendName("");
      toast({ title: "Friend added!", status: "success" });
    } catch (err) {
      toast({ title: "Failed to add friend", status: "error" });
    }
  };

  const handleCalculate = async () => {
    if (!amount || selectedUsers.length === 0) {
      toast({
        title: "Please enter amount and select users.",
        status: "warning",
      });
      return;
    }
    if (!currentUser) {
      toast({ title: "User not authenticated", status: "error" });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/expenses/split`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerId: currentUser,
          amount: parseFloat(amount),
          product,
          place,
          remarks,
          date,
          users: selectedUsers,
        }),
      });
      if (!res.ok) throw new Error("Failed to split expense");
      const newExpense = await res.json();
      toast({ title: "Expense split!", status: "success" });
      setAmount("");
      setProduct("");
      setPlace("");
      setRemarks("");
      setSelectedUsers([]);
      setDate("");
      setExpenses((prev: any[]) => [newExpense, ...prev]);
    } catch (err) {
      toast({ title: "Failed to split expense", status: "error" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-br, teal.50, teal.100)"
    >
      <Box
        w="100%"
        maxW="lg"
        p={8}
        borderWidth={1}
        borderRadius="2xl"
        boxShadow="2xl"
        bg="white"
      >
        <Flex align="center" mb={6}>
          <Heading size="lg" color="teal.600">
            Money Splitter
          </Heading>
          <Spacer />
          <IconButton
            aria-label="Logout"
            icon={<FiLogOut />}
            colorScheme="red"
            variant="ghost"
            onClick={handleLogout}
          />
        </Flex>

        <VStack spacing={6} align="stretch">
          {/* Add Friend */}
          <Box bg="teal.50" p={4} borderRadius="lg" boxShadow="sm">
            <Flex as={FormControl} align="center">
              <Input
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="Add a friend by name"
                mr={2}
                bg="white"
              />
              <Button colorScheme="teal" onClick={handleAddFriend}>
                Add Friend
              </Button>
            </Flex>
          </Box>

          {/* Create Expense */}
          <Box bg="gray.50" p={6} borderRadius="lg" boxShadow="sm">
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Product Name</FormLabel>
                <Input
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g. Pizza"
                  bg="white"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Amount</FormLabel>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 100"
                  bg="white"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Place</FormLabel>
                <Input
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="e.g. Restaurant"
                  bg="white"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  bg="white"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Remarks</FormLabel>
                <Input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional"
                  bg="white"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Select Friends to Split</FormLabel>
                <Select
                  multiple
                  onChange={handleUserSelect}
                  value={selectedUsers}
                  bg="white"
                  height="auto"
                >
                  {friends.map((f) => (
                    <option key={f.id} value={f.id.toString()}>
                      {f.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Button colorScheme="teal" onClick={handleCalculate}>
                Split Expense
              </Button>
            </VStack>
          </Box>

          {/* Expense List */}
          <Box mt={6}>
            <FormControl>
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
              />
            </FormControl>
            <Divider my={4} />
            <VStack spacing={3} align="stretch" maxH="300px" overflowY="auto">
              {filteredExpenses.map((exp, idx) => (
                <Box
                  key={idx}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  bg="gray.50"
                >
                  <Text fontWeight="bold">
                    {exp.product} - ₹{exp.amount}
                  </Text>
                  <Text fontSize="sm">{exp.place}</Text>
                  <Text fontSize="sm">Date: {exp.date}</Text>
                  {exp.remarks && (
                    <Text fontSize="sm">Note: {exp.remarks}</Text>
                  )}
                </Box>
              ))}
              {filteredExpenses.length === 0 && (
                <Text color="gray.500" align="center">
                  No expenses found.
                </Text>
              )}
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
}
