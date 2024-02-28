# VCNFT
## Projecto Final 2023 - Ignacio Villanueva
#### Tutor: Santiago Valles

## Introduccion
En este repositorio se puede encontrar el trabajo final de Ignacio Villanueva orientado a Identidad Autosoberana en combinacion de NFTs. Este proyecto de se compone de una base de investigacion sobre tecnologias emergentes y como se pueden aplicar, y por el otro lado el proyecto busca establecer mediante una libreria el facil uso de estas tecnologias nuevas. En este proyecto se definiran conceptos nuevos que buscan ampliar el dominio de la tecnologia.

### VCNFT, Que es?
El nombre VCNFT parte de la combinacion de Verifiable Crendentials (VC) y Non-Fungible Tokens (NFT). Ambos son tecnologias nuevas donde cada una tenia sus fortalezas. Por un lado Credenciales Verificable nos permiten describir y verificar una identidad de forma segura. Por el otro, NFTs nos dan la capacidad de transferidad la propiedad de un bien no fungible de forma transparente y rastraeble. Ambos se plantean para el uso de la identidad, es un tema de grandes debates cual es superior al otro. A cambio, en este proyecto se planteara una solucion alternativa en donde se combinan ambas tecnologias para beneficiarse de las fortalezas de cada uno, las cuales son altamente complementarias.

## Composicion del Proyecto
- **Libreria**: En la carpeta ```src``` se podra encontrar todo el codigo del proyecto. Este se compone de 3 partes:
    - Libreria Principal (core): Aqui se podra encontrar el nucleo del proyecto, en donde se encuentran todas las funcionalidades centrales.
    - Librerias Auxiliares (tbd, blockchain): La libreria principal establece 2 interfaces para poder interactuar con servicios externos y mantenerse agnosticos al servicio utilizados. Estos son: BlockchainProvider y SSIProvider, donde permiten acceder a funcionalidades del Blockchain y SSI, respectivamente. Estas librerias auxiliares se espera que cada servicio tenga su propia. Se crearon 2 librerias auxiliares para el uso de este proyecto utilizando el servicio de [TBD](https://tbd.website) para SSI y [Etherjs](https://docs.ethers.org/v6/) junto a [Infura](https://docs.ethers.org/v6/) para Blockchain.
    - Applicacion Demo: Esta applicacion se creo para demostrar las capacidades de la libreria principal. Se compone de un frontend hecha en ReactJS junto a un backend hecho en NestJS con MongoDB, donde ambos interactuan con la libreria principal. Se debe tomar en consideracion que esta aplicacion web no utiliza la mejores practicas en terminos de dessarollo web, ya que esto excede los objetivos del proyect su fin es puramente demostrativo de la libreria princial. Muchos de los procedimientos no se deberian utilizar en ninguna proyecto real (Ejemplo: guardar claves privadas en el almecenamiento del browser).
- **Documentacion**: En la carpeta ```doc``` se podran encontrar toda la documentacion en detalle sobre la investigacion previa al desarrollo, la decisiones tomadas y la explicacion de cada una de las funcionalidades.

## Instalacion
#### Requerimientos
- NPM
- Docker
- [TBD SSI Service](https://developer.tbd.website/docs/ssi/run-ssi-service/)
- [Provedor Blockchain](https://www.infura.io/)

Para pode ejecutar la libreria es muy ya que todo se encuentra dockerizado. Ejecutar los siguientes commando para iniciar un servidor de prueba.

```sh
git clone https://github.com/nacho-villanueva/vcnft.git
cd ./vcnft
npm install
docker compose up
```

Para apagar los servicios:
```sh
docker compose down
```

El frontend y backend requieren de ciertas configuraciones que se pueden definir en un ```.env``` que se encuentre en la raiz de ```packages/demo-frontend2``` y ```packages/demo-backend```

Frontend:
```.env
VITE_BASE_URL=http://localhost:3002 # URL base del frontend
```

Backend:
```
## JSON RPC URL de Infura. 
INFURA_ETH_MAINNET="https://mainnet.infura.io/v3/CODIGO_API_DE_INFURA"
INFURA_ETH_GOERLI="https://goerli.infura.io/v3/CODIGO_API_DE_INFURA"
INFURA_MATIC_MAINNET="https://polygon-mainnet.infura.io/v3/CODIGO_API_DE_INFURA"
INFURA_MATIC_MUMBAI="https://polygon-mumbai.infura.io/v3/CODIGO_API_DE_INFURA"

## URL al servidor de SSI Service de TBD.
TBD_URL=""

## Clave Privada de una wallet. Esta debe tener fondos para hacer transacciones en los blockchains que se vayan a utilizar.
SIGNER_DEFAULT="{CLAVE_PRIVADA_DE_WALLET}"

## Address de los contratos NFT en donde se emitiran nuevas credenciales. Por ahora solo ERC-721 es soportado. 
NFT_CONTRACT_ETH=""
NFT_CONTRACT_GOERLI="0xe069b10800Aab13CBc2bb8FACdF2df0b6CEAf5f8"
NFT_CONTRACT_MATIC=""
NFT_CONTRACT_MUMBAI=""
```

Tras instalar toda las dependencias se podra acceder al frontend mediante ```localhost:3002```.

Para ejecutar los archivos de testeo se puede utilizar los siguientes comandos:
```sh
npx nx test core
npx nx test tbd
```

### Demo Hosteada
Si solo quiere probar como funciona, se puede encontrar una demo hosteada en vcnft.me
Esta se encuentra hosteada en DigitalOcean, la cual sera dada de baja al finalizar su periodo de uso gratis.
