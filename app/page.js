'use client'
import {Box} from "$chakra";
import appConfig from "$packageJSON";

export default function Page() {
  return <Box  justifyContent="center" display="flex" alignItems="center" w="100%" h="100vh">
      <Box color="primary" fontWeight="bold" fontSize="20px" as="h1">Welcome to {appConfig.name} APP</Box>
  </Box>
}