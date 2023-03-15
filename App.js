import React from 'react'
import Navigation from './src/Navigation/Navigation'
import { StripeProvider } from '@stripe/stripe-react-native'
export default function App() {
  return (
    <StripeProvider 
    publishableKey='pk_test_51MlBs3BwiLSND57HpBg14bqerhhXFG1x64dp4fXdnYttyEhBzfOljKeoMzDWJchdnmWTF6OClLF1AheuMu3hJ0Zw00xUWGJxXI' >
    <Navigation />
    </StripeProvider>
    
  )
}
