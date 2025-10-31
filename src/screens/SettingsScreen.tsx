import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { makeRedirectUri, startAsync } from "expo-auth-session/build/AuthSession";
import { CategoryPreferenceCard } from "../components/CategoryPreferenceCard";
import { BottomTabBar } from "../components/BottomTabBar";
import { HeaderWithLogo } from "../components/HeaderWithLogo";
import { borderRadius, colors, fontSizes, fonts, shadow, spacing } from "../styles/theme";
import { TabKey } from "../types/navigation";
import { categories, CategoryKey } from "../data/categories";

type SettingsScreenProps = {
  userEmail: string;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onLogout: () => void;
  dataPreferences: Record<CategoryKey, boolean>;
  alertPreferences: Record<CategoryKey, boolean>;
  onToggleDataPreference: (key: CategoryKey) => void;
  onToggleAlertPreference: (key: CategoryKey) => void;
  onSetAllDataPreferences: (value: boolean) => void;
  onSetAllAlertPreferences: (value: boolean) => void;
};

type ProfileFields = {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  email: string;
};

async function authenticateWithInstagramTester(username: string, password: string) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  if (!username || !password) {
    throw new Error("Informe usuario e senha para continuar.");
  }
  if (password.length < 6) {
    throw new Error("Senha invalida. Verifique e tente novamente.");
  }
}

// Configure os valores de client id/redirect via EXPO_PUBLIC_* em app.json ou arquivos .env.
const LINKEDIN_AUTH_ENDPOINT = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_SCOPES = ["r_liteprofile", "r_emailaddress"];
const LINKEDIN_CLIENT_ID = process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID ?? "";
const LINKEDIN_REDIRECT_URI_OVERRIDE = process.env.EXPO_PUBLIC_LINKEDIN_REDIRECT_URI ?? "";

function buildLinkedinAuthUrl(clientId: string, redirectUri: string, state: string) {
  const scope = encodeURIComponent(LINKEDIN_SCOPES.join(" "));
  return `${LINKEDIN_AUTH_ENDPOINT}?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=${scope}&state=${encodeURIComponent(state)}`;
}

function generateOAuthState() {
  return Math.random().toString(36).slice(2);
}

/** Manage the editable profile fields shown in the form. */
function useProfileForm(initialEmail: string) {
  const [profile, setProfile] = useState<ProfileFields>({
    firstName: "",
    lastName: "",
    birthDate: "",
    phone: "",
    email: initialEmail,
  });

  const updateField = useCallback(<K extends keyof ProfileFields>(field: K, value: ProfileFields[K]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }, []);

  return { profile, updateField };
}

/** Handle the pseudo-auth flow used to emulate Instagram validation. */
function useInstagramIntegration() {
  const [enabled, setEnabled] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = useCallback(() => {
    setUsername("");
    setPassword("");
    setError(null);
    setLoading(false);
  }, []);

  const toggle = useCallback(
    (next: boolean) => {
      if (next) {
        setAuthVisible(true);
        setError(null);
        return;
      }
      setEnabled(false);
      resetForm();
    },
    [resetForm],
  );

  const closeModal = useCallback(() => {
    setAuthVisible(false);
    resetForm();
  }, [resetForm]);

  const connect = useCallback(
    async (usernameValue: string, passwordValue: string) => {
      setLoading(true);
      setError(null);
      try {
        await authenticateWithInstagramTester(usernameValue.trim(), passwordValue);
        setEnabled(true);
        setAuthVisible(false);
        resetForm();
        Alert.alert("Instagram", "Conta conectada com sucesso.");
      } catch (cause) {
        setEnabled(false);
        setError(cause instanceof Error ? cause.message : "Nao foi possivel validar suas credenciais.");
      } finally {
        setLoading(false);
      }
    },
    [resetForm],
  );

  return {
    enabled,
    authVisible,
    username,
    setUsername,
    password,
    setPassword,
    error,
    loading,
    toggle,
    closeModal,
    connect,
  };
}

/** Launch the LinkedIn OAuth browser flow and track its status. */
function useLinkedinIntegration() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirectUri = useMemo(
    () =>
      LINKEDIN_REDIRECT_URI_OVERRIDE
        ? LINKEDIN_REDIRECT_URI_OVERRIDE
        : makeRedirectUri({ preferLocalhost: true }),
    [],
  );

  const toggle = useCallback(
    async (next: boolean) => {
      if (!next) {
        setEnabled(false);
        return;
      }

      if (!LINKEDIN_CLIENT_ID) {
        Alert.alert(
          "LinkedIn",
          "Configure EXPO_PUBLIC_LINKEDIN_CLIENT_ID e, se necessario, EXPO_PUBLIC_LINKEDIN_REDIRECT_URI antes de conectar.",
        );
        return;
      }

      setLoading(true);
      const state = generateOAuthState();
      const authUrl = buildLinkedinAuthUrl(LINKEDIN_CLIENT_ID, redirectUri, state);

      try {
        const result = await startAsync({ authUrl, returnUrl: redirectUri });

        if (result.type === "success") {
          const code = result.params?.code;
          if (!code) {
            setEnabled(false);
            Alert.alert("LinkedIn", "Nenhum authorization code foi retornado pela plataforma.");
            return;
          }
          const returnedState = result.params?.state;
          if (returnedState && returnedState !== state) {
            setEnabled(false);
            Alert.alert("LinkedIn", "Estado de seguranca invalido recebido na autorizacao.");
            return;
          }
          setEnabled(true);
          Alert.alert(
            "LinkedIn",
            "Autorizacao concluida. Troque o authorization code pelo token de acesso no seu backend.",
          );
        } else if (result.type === "error") {
          const errorMessage =
            result.params?.error_description ??
            result.params?.error ??
            result.error?.message ??
            "Nao foi possivel concluir a autorizacao com o LinkedIn.";
          setEnabled(false);
          Alert.alert("LinkedIn", errorMessage);
        } else if (result.type === "dismiss" || result.type === "cancel") {
          setEnabled(false);
          Alert.alert("LinkedIn", "Autorizacao cancelada.");
        } else if (result.type === "locked") {
          Alert.alert("LinkedIn", "Ja existe uma autorizacao em andamento. Tente novamente em instantes.");
        }
      } catch (error) {
        setEnabled(false);
        Alert.alert("LinkedIn", "Ocorreu um erro ao iniciar a autorizacao. Tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [redirectUri],
  );

  return { enabled, loading, toggle };
}


export function SettingsScreen({ userEmail, activeTab, onTabChange, onLogout, dataPreferences, alertPreferences, onToggleDataPreference, onToggleAlertPreference, onSetAllDataPreferences, onSetAllAlertPreferences }: SettingsScreenProps) {
  const { profile, updateField } = useProfileForm(userEmail);
  const {
    enabled: instagramEnabled,
    authVisible: instagramAuthVisible,
    username: instagramUsername,
    setUsername: setInstagramUsername,
    password: instagramPassword,
    setPassword: setInstagramPassword,
    error: instagramError,
    loading: instagramLoading,
    toggle: toggleInstagram,
    closeModal: closeInstagramAuth,
    connect: connectInstagram,
  } = useInstagramIntegration();
  const {
    enabled: linkedinEnabled,
    loading: linkedinLoading,
    toggle: handleLinkedinToggle,
  } = useLinkedinIntegration();
  const handleInstagramToggle = toggleInstagram;

  const allDataEnabled = useMemo(
    () => categories.every((category) => dataPreferences[category.key]),
    [dataPreferences],
  );
  const allAlertsEnabled = useMemo(
    () => categories.every((category) => alertPreferences[category.key]),
    [alertPreferences],
  );

  const handleInstagramConnect = useCallback(() => {
    connectInstagram(instagramUsername, instagramPassword);
  }, [connectInstagram, instagramPassword, instagramUsername]);



  return (
    <View style={styles.container}>
      <HeaderWithLogo
        title="Meu espaço"
        greeting={`Olá ${userEmail},`}

      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cadastrais</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              value={profile.firstName}
              onChangeText={(value) => updateField("firstName", value)}
              placeholder="Seu nome"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
            />

            <Text style={styles.label}>Sobrenome</Text>
            <TextInput
              value={profile.lastName}
              onChangeText={(value) => updateField("lastName", value)}
              placeholder="Seu sobrenome"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
            />

            <Text style={styles.label}>Data de nascimento</Text>
            <TextInput
              value={profile.birthDate}
              onChangeText={(value) => updateField("birthDate", value)}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Telefone (com DDD)</Text>
            <TextInput
              value={profile.phone}
              onChangeText={(value) => updateField("phone", value)}
              placeholder="(11) 99999-0000"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={profile.email}
              onChangeText={(value) => updateField("email", value)}
              placeholder="seuemail@dominio.com"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integracoes</Text>
          <View style={styles.card}>
            <View style={styles.integrationRow}>
              <View style={styles.integrationCopy}>
                <Text style={styles.integrationTitle}>Instagram Insights</Text>
                <Text style={styles.integrationDescription}>
                  Conecte seu Instagram tester para visualizar dados integrados diretamente no app.
                </Text>
              </View>
              <Switch
                value={instagramEnabled}
                onValueChange={handleInstagramToggle}
                thumbColor={colors.surface}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            <Text style={styles.toggleHint}>
              Essa integracao permanece inativa ate que as credenciais sejam validadas com exito.
            </Text>

            <View style={styles.integrationDivider} />

            <View style={styles.integrationRow}>
              <View style={styles.integrationCopy}>
                <Text style={styles.integrationTitle}>LinkedIn Insights</Text>
                <Text style={styles.integrationDescription}>
                  Conecte seu app do LinkedIn e autorize o acesso diretamente na tela oficial da plataforma.
                </Text>
              </View>
              <Switch
                value={linkedinEnabled}
                onValueChange={handleLinkedinToggle}
                thumbColor={colors.surface}
                trackColor={{ false: colors.border, true: colors.primary }}
                disabled={linkedinLoading}
              />
            </View>
            <Text style={styles.toggleHint}>
              {linkedinEnabled
                ? "Autorizacao recebida. Troque o authorization code pelo token no backend para concluir."
                : "Ao ativar abriremos o fluxo OAuth do LinkedIn; finalize o login para concluir a integracao."}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <View style={styles.card}>
            <View style={styles.columnsHeader}>
              <Text style={[styles.columnLabel, styles.columnCategory]}>Categoria</Text>
              <Text style={[styles.columnLabel, styles.columnOption]}>Home</Text>
              <Text style={[styles.columnLabel, styles.columnOption]}>Alertas</Text>
            </View>

            {categories.map((category) => (
              <CategoryPreferenceCard
                key={category.key}
                label={category.label}
                icon={category.icon}
                dataEnabled={dataPreferences[category.key]}
                alertEnabled={alertPreferences[category.key]}
                onToggleData={() => onToggleDataPreference(category.key)}
                onToggleAlert={() => onToggleAlertPreference(category.key)}
              />
            ))}

            <View style={styles.actionsRow}>
              <Pressable
                style={[styles.actionButton, allDataEnabled && styles.actionButtonActive]}
                onPress={() => onSetAllDataPreferences(!allDataEnabled)}
              >
                <Text style={[styles.actionButtonText, allDataEnabled && styles.actionButtonTextActive]}>
                  {allDataEnabled ? "Desmarcar todas" : "Marcar todas"}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, allAlertsEnabled && styles.actionButtonActive]}
                onPress={() => onSetAllAlertPreferences(!allAlertsEnabled)}
              >
                <Text style={[styles.actionButtonText, allAlertsEnabled && styles.actionButtonTextActive]}>
                  {allAlertsEnabled ? "Desativar alertas" : "Ativar alertas"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomTabBar
        activeKey={activeTab}
        onTabPress={(tab) => {
          if (tab === "logout") {
            onLogout();
            return;
          }
          onTabChange(tab);
        }}
      />

      <Modal visible={instagramAuthVisible} transparent animationType="fade" onRequestClose={closeInstagramAuth}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Conectar Instagram</Text>
            <Text style={styles.modalDescription}>
              Informe o usuario e a senha do Instagram criados no Meta Developers para autorizar o acesso.
            </Text>
            <TextInput
              value={instagramUsername}
              onChangeText={setInstagramUsername}
              placeholder="Usuario Instagram"
              placeholderTextColor={colors.textTertiary}
              style={styles.modalInput}
              autoCapitalize="none"
            />
            <TextInput
              value={instagramPassword}
              onChangeText={setInstagramPassword}
              placeholder="Senha"
              placeholderTextColor={colors.textTertiary}
              style={styles.modalInput}
              secureTextEntry
            />
            {instagramError ? <Text style={styles.modalError}>{instagramError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.modalSecondaryButton]} onPress={closeInstagramAuth} disabled={instagramLoading}>
                <Text style={[styles.modalButtonText, styles.modalSecondaryButtonText]}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalPrimaryButton, instagramLoading && styles.modalPrimaryButtonDisabled]}
                onPress={handleInstagramConnect}
                disabled={instagramLoading}
              >
                {instagramLoading ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalPrimaryButtonText]}>Conectar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xLarge,
    paddingHorizontal: spacing.large,
  },
  section: {
    marginBottom: spacing.xLarge,
  },
  sectionTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.medium,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    gap: spacing.medium,
    ...shadow.light,
  },
  label: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  input: {
    height: 48,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.medium,
    fontFamily: fonts.regular,
    fontSize: fontSizes.regular,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  columnsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.medium,
    gap: spacing.small,
  },
  columnLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  columnCategory: {
    flex: 1.4,
  },
  columnOption: {
    flex: 1,
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.small,
    marginTop: spacing.medium,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.small,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  actionButtonTextActive: {
    color: colors.background,
  },
  integrationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.medium,
  },
  integrationCopy: {
    flex: 1,
    gap: spacing.small / 2,
  },
  integrationTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.regular,
    color: colors.textPrimary,
  },
  integrationDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: colors.textSecondary,
  },
  integrationDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.medium,
  },
  toggleHint: {
    marginTop: spacing.medium,
    fontFamily: fonts.regular,
    fontSize: fontSizes.small - 2,
    color: colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: spacing.large,
    justifyContent: "center",
  },
  modalContainer: {
    borderRadius: borderRadius.large,
    backgroundColor: colors.surface,
    padding: spacing.large,
    gap: spacing.medium,
  },
  modalTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.large,
    color: colors.textPrimary,
  },
  modalDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.small,
    color: colors.textSecondary,
  },
  modalInput: {
    height: 48,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.medium,
    fontFamily: fonts.regular,
    fontSize: fontSizes.regular,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  modalError: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    color: colors.laranjaImpacto,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.small,
  },
  modalButton: {
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  modalButtonText: {
    fontFamily: fonts.semibold,
    fontSize: fontSizes.small,
  },
  modalSecondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalSecondaryButtonText: {
    color: colors.textSecondary,
  },
  modalPrimaryButton: {
    backgroundColor: colors.primary,
  },
  modalPrimaryButtonDisabled: {
    opacity: 0.6,
  },
  modalPrimaryButtonText: {
    color: colors.background,
  },
});
