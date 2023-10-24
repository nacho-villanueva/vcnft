import {config} from 'dotenv'
config({
  path: '.env.test'
})

if(!process.env["TEST_WALLET_PRIVATE_KEY"]) {
  throw new Error('TEST_WALLET_PRIVATE_KEY env is not set')
}
