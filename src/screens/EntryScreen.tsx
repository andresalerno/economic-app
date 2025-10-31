import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { borderRadius, colors, fontSizes, fonts, spacing } from './../styles/theme';

const logo: ImageSourcePropType = require('../../assets/logo-principal/MainLine-LightBgSmall.png');

export type RegistrationOrigin = 'manual' | 'linkedin' | 'instagram';

type EntryScreenProps = {
  onAuthenticate: (email: string, password: string) => Promise<boolean> | boolean;
  onRegister: (data: RegistrationData, origin: RegistrationOrigin) => Promise<void> | void;
};

export type RegistrationData = {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  email: string;
  password: string;
};

type RegistrationStep = {
  key: keyof RegistrationData;
  title: string;
  description: string;
  placeholder: string;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  secureTextEntry?: boolean;
};

function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : '';
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function createInitialRegistrationState(): RegistrationData {
  return {
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    email: '',
    password: '',
  };
}

// Configura a ordem das perguntas exibidas no fluxo de cadastro.
const registrationSteps: RegistrationStep[] = [
  {
    key: 'firstName',
    title: 'Vamos comecar',
    description: 'Qual e o seu nome?',
    placeholder: 'Seu nome',
    autoCapitalize: 'words',
  },
  {
    key: 'lastName',
    title: 'Agora, o sobrenome',
    description: 'Qual e o seu sobrenome?',
    placeholder: 'Seu sobrenome',
    autoCapitalize: 'words',
  },
  {
    key: 'birthDate',
    title: 'Data de nascimento',
    description: 'Quando voce nasceu?',
    placeholder: 'DD/MM/AAAA',
    keyboardType: 'numeric',
    autoCapitalize: 'none',
  },
  {
    key: 'phone',
    title: 'Telefone',
    description: 'Qual telefone podemos usar?',
    placeholder: '(11) 99999-0000',
    keyboardType: 'phone-pad',
    autoCapitalize: 'none',
  },
  {
    key: 'email',
    title: 'E-mail de contato',
    description: 'Qual e o seu e-mail principal?',
    placeholder: 'seuemail@dominio.com',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  {
    key: 'password',
    title: 'Defina sua senha',
    description: 'Crie uma senha segura para acessar o app.',
    placeholder: 'Crie uma senha',
    secureTextEntry: true,
    autoCapitalize: 'none',
  },
];

const PROFILE_COMPLETION_FIELDS: Array<keyof RegistrationData> = [
  'firstName',
  'lastName',
  'birthDate',
  'phone',
  'email',
];

// Localiza o primeiro passo sem preenchimento para posicionar o wizard.
function findFirstIncompleteStep(data: RegistrationData) {
  const index = registrationSteps.findIndex(({ key }) => !data[key].trim());
  return index >= 0 ? index : registrationSteps.length - 1;
}

function normalizeRegistrationData(data: RegistrationData): RegistrationData {
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    birthDate: data.birthDate.trim(),
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
  };
}

function applyFormatting(field: keyof RegistrationData, value: string) {
  if (field === 'birthDate') {
    return formatBirthDateInput(value);
  }
  if (field === 'phone') {
    return formatPhoneInput(value);
  }
  return value;
}

// Simula dados retornados por provedores sociais (placeholder até integrar com backend).
async function fetchSocialProfile(provider: RegistrationOrigin): Promise<Partial<RegistrationData>> {
  // TODO: substituir por chamadas reais ao LinkedIn/Instagram assim que o backend estiver pronto.
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (provider === 'linkedin') {
    return {
      firstName: 'Renata',
      lastName: 'Souza',
      email: 'renata.souza@linkedin.com',
      birthDate: '14/08/1989',
      phone: '',
    };
  }

  if (provider === 'instagram') {
    return {
      firstName: 'Thiago',
      lastName: 'Oliveira',
      email: '',
      birthDate: '',
      phone: '(11) 98888-0000',
    };
  }

  return {};
}

export function EntryScreen({ onAuthenticate, onRegister }: EntryScreenProps) {
  // Estado do login rápido (e credenciais pré-preenchidas após cadastro).
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado do fluxo de cadastro multi-etapas.
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>(() =>
    createInitialRegistrationState(),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [registrationMode, setRegistrationMode] = useState<'choice' | 'form'>('choice');
  const [registrationOrigin, setRegistrationOrigin] = useState<RegistrationOrigin>('manual');
  const [integrationLoading, setIntegrationLoading] = useState(false);
  const [integrationError, setIntegrationError] = useState<string | null>(null);
  const [isCompletingRegistration, setIsCompletingRegistration] = useState(false);

  // Refs para animações do logotipo e das etapas do wizard.
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const stepOpacity = useRef(new Animated.Value(1)).current;
  const stepTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(logoTranslateY, {
          toValue: -150,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setIsAnimationFinished(true));
  }, [contentOpacity, logoOpacity, logoTranslateY]);

  useEffect(() => {
    if (!isCreatingAccount || registrationMode !== 'form') {
      return;
    }

    stepOpacity.setValue(0);
    stepTranslateX.setValue(24);

    Animated.parallel([
      Animated.timing(stepOpacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(stepTranslateX, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep, isCreatingAccount, registrationMode, stepOpacity, stepTranslateX]);

  function updateRegistrationField(field: keyof RegistrationData, value: string) {
    const nextValue = applyFormatting(field, value);
    setRegistrationData((prev) => ({ ...prev, [field]: nextValue }));
  }

  // Reinicia todos os controles relativos ao cadastro.
  function resetRegistrationFlow() {
    setRegistrationData(createInitialRegistrationState());
    setCurrentStep(0);
    setRegistrationMode('choice');
    setRegistrationOrigin('manual');
    setIntegrationLoading(false);
    setIntegrationError(null);
    setIsCompletingRegistration(false);
    stepOpacity.setValue(1);
    stepTranslateX.setValue(0);
  }

  function startManualRegistration() {
    resetRegistrationFlow();
    setRegistrationMode('form');
    setRegistrationOrigin('manual');
    setIsCreatingAccount(true);
    setErrorMessage(null);
  }

  async function handleConnectWithProvider(provider: RegistrationOrigin) {
    if (provider === 'manual') {
      startManualRegistration();
      return;
    }

    setIntegrationLoading(true);
    setIntegrationError(null);
    setRegistrationOrigin(provider);

    try {
      const socialData = await fetchSocialProfile(provider);
      const nextData = createInitialRegistrationState();
      (Object.keys(nextData) as Array<keyof RegistrationData>).forEach((key) => {
        const incoming = socialData[key];
        if (incoming !== undefined) {
          nextData[key] = applyFormatting(key, incoming);
        }
      });
      setRegistrationData(nextData);
      setCurrentStep(findFirstIncompleteStep(nextData));
      setRegistrationMode('form');
      stepOpacity.setValue(1);
      stepTranslateX.setValue(0);
      setIsCreatingAccount(true);
      setErrorMessage(null);
    } catch (error) {
      setIntegrationError('Nao foi possivel conectar. Tente novamente.');
    } finally {
      setIntegrationLoading(false);
    }
  }

  const activeStep = registrationSteps[currentStep];
  const isLastStep = currentStep === registrationSteps.length - 1;

  // Alterna entre login e cadastro, limpando qualquer estado intermediário.
  function handleToggleCreateAccount() {
    const next = !isCreatingAccount;
    setIsCreatingAccount(next);
    setErrorMessage(null);
    setIsSubmitting(false);
    resetRegistrationFlow();
    if (next) {
      setRegistrationMode('choice');
    }
  }

  // Volta uma etapa no wizard ou retorna à escolha de método.
  function handleRegistrationBack() {
    setErrorMessage(null);
    if (currentStep === 0) {
      setRegistrationMode('choice');
      return;
    }
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }

  // Valida o campo atual e avança para a etapa seguinte (ou finaliza o cadastro).
  async function handleRegistrationAdvance() {
    const value = registrationData[activeStep.key].trim();

    if (!value) {
      setErrorMessage('Preencha esta informacao para continuar.');
      return;
    }

    setErrorMessage(null);

    if (isLastStep) {
      setIsCompletingRegistration(true);
      const normalizedData = normalizeRegistrationData(registrationData);

      try {
        await onRegister(normalizedData, registrationOrigin);
        setEmail(normalizedData.email);
        setPassword(normalizedData.password);
        setIsCreatingAccount(false);
        resetRegistrationFlow();
      } catch (error) {
        setErrorMessage('Nao foi possivel concluir o cadastro. Tente novamente.');
      } finally {
        setIsCompletingRegistration(false);
      }
      return;
    }

    setCurrentStep((prev) => prev + 1);
  }

  // Realiza o login tradicional usando e-mail + senha.
  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const success = await onAuthenticate(email, password);

      if (!success) {
        setErrorMessage('Credenciais inválidas. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Animated.Image
        source={logo}
        resizeMode="contain"
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }],
          },
        ]}
      />

      {isAnimationFinished && (
        <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
          {!isCreatingAccount && (
            <Text style={styles.title}>Economia descomplicada nas suas mãos</Text>
          )}


          <View style={styles.form}>
            {isCreatingAccount ? (
              registrationMode === 'choice' ? (
                <View style={styles.registrationChoiceWrapper}>
                  <View style={styles.registrationChoice}>
                  <Text style={styles.registrationChoiceTitle}>Como deseja criar sua conta?</Text>
                  <Text style={styles.registrationChoiceSubtitle}>
                    Conecte seu LinkedIn ou Instagram para preencher automaticamente os primeiros dados.
                  </Text>

                  {integrationError ? <Text style={styles.error}>{integrationError}</Text> : null}

                  <View style={styles.integrationOptions}>
                    <TouchableOpacity
                      style={[
                        styles.integrationButton,
                        integrationLoading &&
                          registrationOrigin === 'linkedin' &&
                          styles.integrationButtonBusy,
                      ]}
                      onPress={() => handleConnectWithProvider('linkedin')}
                      disabled={integrationLoading}
                      activeOpacity={0.85}
                    >
                      {integrationLoading && registrationOrigin === 'linkedin' ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="linkedin" size={20} color="#0A66C2" />
                          <Text style={styles.integrationButtonText}>Conectar com LinkedIn</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.integrationButton,
                        integrationLoading &&
                          registrationOrigin === 'instagram' &&
                          styles.integrationButtonBusy,
                      ]}
                      onPress={() => handleConnectWithProvider('instagram')}
                      disabled={integrationLoading}
                      activeOpacity={0.85}
                    >
                      {integrationLoading && registrationOrigin === 'instagram' ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="instagram" size={20} color="#E1306C" />
                          <Text style={styles.integrationButtonText}>Conectar com Instagram</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                    <TouchableOpacity
                      style={[styles.integrationButton, styles.manualButton]}
                      onPress={() => handleConnectWithProvider('manual')}
                      disabled={integrationLoading}
                      activeOpacity={0.85}
                    >
                      <MaterialCommunityIcons name="account-edit" size={20} color={colors.background} />
                      <Text style={[styles.integrationButtonText, styles.manualButtonText]}>
                        Prefiro preencher
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.integrationButton, styles.backButton]}
                      onPress={handleToggleCreateAccount}
                      disabled={integrationLoading}
                      activeOpacity={0.85}
                    >
                      <MaterialCommunityIcons name="arrow-left" size={20} color={colors.textPrimary} />
                      <Text style={[styles.integrationButtonText, styles.backButtonText]}>Voltar para o login</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.registrationFlow}>
                  <View style={styles.registrationHeader}>
                    <Text style={styles.stepCounter}>
                      Passo {currentStep + 1} de {registrationSteps.length}
                    </Text>
                    {registrationOrigin !== 'manual' ? (
                      <TouchableOpacity onPress={() => setRegistrationMode('choice')} activeOpacity={0.8}>
                        <Text style={styles.registrationChangeLink}>Trocar metodo</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <Animated.View
                    style={[
                      styles.registrationCard,
                      { opacity: stepOpacity, transform: [{ translateX: stepTranslateX }] },
                    ]}
                  >
                    {registrationOrigin !== 'manual' ? (
                      <View style={styles.providerNotice}>
                        <MaterialCommunityIcons
                          name={registrationOrigin === 'linkedin' ? 'linkedin' : 'instagram'}
                          size={18}
                          color={colors.primary}
                        />
                        <Text style={styles.providerNoticeText}>
                          {registrationOrigin === 'linkedin'
                            ? 'Importamos alguns dados do LinkedIn. Revise as informacoes abaixo.'
                            : 'Importamos alguns dados do Instagram. Revise as informacoes abaixo.'}
                        </Text>
                      </View>
                    ) : null}

                    <Text style={styles.registrationTitle}>{activeStep.title}</Text>
                    <Text style={styles.registrationDescription}>{activeStep.description}</Text>

                    <TextInput
                      value={registrationData[activeStep.key]}
                      onChangeText={(value) => updateRegistrationField(activeStep.key, value)}
                      placeholder={activeStep.placeholder}
                      placeholderTextColor={colors.textTertiary}
                      style={styles.input}
                      keyboardType={activeStep.keyboardType}
                      autoCapitalize={activeStep.autoCapitalize ?? 'none'}
                      autoCorrect={activeStep.autoCapitalize === 'words'}
                      secureTextEntry={activeStep.secureTextEntry}
                      returnKeyType={isLastStep ? 'done' : 'next'}
                      onSubmitEditing={handleRegistrationAdvance}
                      blurOnSubmit={isLastStep}
                      editable={!isCompletingRegistration}
                    />

                    {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

                    <View style={styles.stepActions}>
                      {currentStep > 0 && (
                        <TouchableOpacity
                          style={styles.secondaryButton}
                          onPress={handleRegistrationBack}
                          activeOpacity={0.8}
                          disabled={isCompletingRegistration}
                        >
                          <Text style={styles.secondaryButtonText}>Voltar</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[
                          styles.button,
                          styles.stepPrimaryButton,
                          isCompletingRegistration && styles.buttonDisabled,
                        ]}
                        activeOpacity={0.8}
                        onPress={handleRegistrationAdvance}
                        disabled={isCompletingRegistration}
                      >
                        <Text style={styles.buttonText}>
                          {isCompletingRegistration ? 'Concluindo...' : isLastStep ? 'Concluir' : 'Avancar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>

                  <View style={styles.registrationFooter}>
                    <TouchableOpacity onPress={() => setRegistrationMode('choice')} activeOpacity={0.8}>
                      <Text style={styles.registrationChangeLink}>Escolher outro metodo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleToggleCreateAccount}>
                      <Text style={styles.registrationExitLink}>Voltar para o login</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            ) : (
              <>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="E-mail"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Senha"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry
                  autoCapitalize="none"
                  style={styles.input}
                />

                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, isSubmitting && styles.buttonDisabled]}
                  activeOpacity={0.8}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>{isSubmitting ? 'Entrando...' : 'Entrar'}</Text>
                </TouchableOpacity>

                <View style={styles.newUserRow}>
                  <Text style={styles.newUserText}>Primeira vez por aqui?</Text>
                  <TouchableOpacity onPress={handleToggleCreateAccount}>
                    <Text style={styles.newUserLink}>Criar meu acesso</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.large,
  },
  logo: {
    width: 220,
    height: 220,
  },
  content: {
    alignItems: 'center',
    marginTop: spacing.large,
    width: '100%',
  },
  title: {
    fontSize: fontSizes.xLarge,
    color: colors.textPrimary,
    fontFamily: fonts.semibold,
    marginBottom: spacing.small,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.regular,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.large,
  },
  form: {
    width: '100%',
    gap: spacing.medium,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.medium,
    fontSize: fontSizes.regular,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    backgroundColor: colors.surface,
  },
  error: {
    color: colors.laranjaImpacto,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.medium,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.medium,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.background,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.medium,
  },
  stepPrimaryButton: {
    flex: 1,
    marginTop: 0,
  },
  newUserRow: {
    marginTop: spacing.medium,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.small,
  },
  newUserText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: fontSizes.regular,
  },
  newUserLink: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.regular,
  },
  registrationFlow: {
    width: '100%',
    gap: spacing.medium,
  },
  registrationChoiceWrapper: {
    width: '100%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registrationChoice: {
    width: '100%',
    maxWidth: 340,
    gap: spacing.medium,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    alignItems: 'center',
  },
  registrationChoiceTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  registrationChoiceSubtitle: {
    fontSize: fontSizes.regular,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  integrationOptions: {
    gap: spacing.small,
    width: '100%',
  },
  integrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.medium,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  integrationButtonBusy: {
    opacity: 0.7,
  },
  integrationButtonText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.regular,
    color: colors.textPrimary,
  },
  manualButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  manualButtonText: {
    color: colors.textPrimary,
  },
  backButton: {
    backgroundColor: colors.surface,
    borderStyle: 'dashed',
  },
  backButtonText: {
    color: colors.textPrimary,
  },
  registrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stepCounter: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  registrationChangeLink: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
  },
  registrationExitLink: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.regular,
  },
  registrationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    gap: spacing.medium,
  },
  registrationTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
  },
  registrationDescription: {
    fontSize: fontSizes.regular,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  providerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  providerNoticeText: {
    flex: 1,
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  stepActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    marginTop: spacing.large,
  },
  registrationFooter: {
    alignSelf: 'stretch',
    marginTop: spacing.medium,
    alignItems: 'flex-end',
    gap: spacing.small,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
});
