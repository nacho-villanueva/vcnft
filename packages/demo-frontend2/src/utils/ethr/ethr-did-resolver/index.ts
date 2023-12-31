import { getResolver } from './resolver'
import { EthrDidController } from './controller'
import {
  bytes32toString,
  DEFAULT_REGISTRY_ADDRESS,
  Errors,
  identifierMatcher,
  interpretIdentifier,
  legacyAlgoMap,
  legacyAttrTypes,
  stringToBytes32,
  verificationMethodTypes,
  MetaSignature,
} from './helpers'

import { default as EthereumDIDRegistry } from './config/EthereumDIDRegistry.json'

export {
  DEFAULT_REGISTRY_ADDRESS as REGISTRY,
  getResolver,
  bytes32toString,
  stringToBytes32,
  EthrDidController,
  /**@deprecated */
  legacyAlgoMap as delegateTypes,
  /**@deprecated */
  legacyAttrTypes as attrTypes,
  verificationMethodTypes,
  identifierMatcher,
  interpretIdentifier,
  Errors,
  EthereumDIDRegistry,
}

export type {MetaSignature} from './helpers'

export { deployments } from './config/deployments'
export type  {EthrDidRegistryDeployment} from './config/deployments'
