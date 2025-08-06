"use client";
import { Box, VStack, Text, List, ListItem } from "@chakra-ui/react";

export default function HistoryPage() {
  // Placeholder data, replace with API
  const history = [
    { product: "Pizza", amount: 100, place: "Restaurant", remarks: "Dinner", date: "2025-08-01" },
    { product: "Movie", amount: 50, place: "Cinema", remarks: "", date: "2025-07-30" },
  ];

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold">Transaction History</Text>
        <List spacing={3}>
          {history.map((item, idx) => (
            <ListItem key={idx} borderBottom="1px" borderColor="gray.100" pb={2} mb={2}>
              <Text><b>Product:</b> {item.product}</Text>
              <Text><b>Amount:</b> ${item.amount}</Text>
              <Text><b>Place:</b> {item.place}</Text>
              <Text><b>Remarks:</b> {item.remarks || "-"}</Text>
              <Text fontSize="sm" color="gray.500">{item.date}</Text>
            </ListItem>
          ))}
        </List>
      </VStack>
    </Box>
  );
}
