// app/providers.tsx
'use client'

import { ChakraProvider } from '@chakra-ui/react'

export function Providers({ children,...rest}) {
  return <ChakraProvider {...rest}>{children}</ChakraProvider>
}