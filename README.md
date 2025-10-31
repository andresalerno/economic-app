# EconomicApp

Aplicativo Expo/React Native para gerenciar finan�as pessoais.

## Pr�-requisitos
- Node.js 18 ou superior
- npm (instalado junto com o Node)
- Emulador Android/iOS configurado **ou** aplicativo Expo Go em um dispositivo f�sico na mesma rede

## Como rodar o projeto
1. Entre na pasta do projeto:
   ```sh
   cd economicApp
   ```
2. Instale as depend�ncias (a primeira vez ou sempre que `package.json` mudar):
   ```sh
   npm install
   ```
3. Inicie o Expo:
   ```sh
   npm run start
   ```
4. Escolha onde abrir:
   - Pressione `a` para abrir no emulador Android configurado
   - Pressione `i` para abrir no simulador iOS (macOS)
   - Leia o QR Code com o app Expo Go em um dispositivo

> Se o app n�o conectar ao Metro Bundler, confirme que o dispositivo/emulador est� na mesma rede do computador e (para Android f�sico) execute `adb reverse tcp:8081 tcp:8081`.

## Login de demonstra��o
Use as credenciais abaixo para acessar a tela Home:
- Usu�rio: `demo@economic.app`
- Senha: `123456`

A valida��o � feita apenas em mem�ria (mock). Ajuste a l�gica em `App.tsx` quando integrar com um backend real.

## criando conexão com a Meta

- https://developers.facebook.com/apps/

