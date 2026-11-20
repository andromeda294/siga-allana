import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { ReminderPreferences } from "@/contexts/AppSettingsContext";

const CHANNEL_ID = "ritmo-daily-reminders";
const WATER_START_HOUR = 9;
const WATER_END_HOUR = 21;

async function ensureNotificationPermission() {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
            name: "Lembretes diários",
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }

    let permission = await Notifications.getPermissionsAsync();
    const isAllowed = () =>
        permission.granted ||
        permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (!isAllowed()) {
        permission = await Notifications.requestPermissionsAsync();
    }
    if (!isAllowed()) {
        throw new Error("Ativa as notificações do Ritmo nas definições do dispositivo e volta a guardar.");
    }
}

export async function scheduleLocalReminders(reminders: ReminderPreferences) {
    const hasEnabledReminder = reminders.waterEnabled || reminders.mealEnabled;
    if (![1, 2, 3, 4, 6].includes(reminders.waterIntervalHours)) {
        throw new RangeError("O intervalo do lembrete de água não é válido.");
    }
    if (
        reminders.mealTimes.length === 0 ||
        !reminders.mealTimes.every((time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    ) {
        throw new RangeError("Os horários dos lembretes de refeições não são válidos.");
    }
    if (Platform.OS === "web") {
        if (hasEnabledReminder) {
            throw new Error("Os lembretes estão disponíveis na aplicação Android e iOS.");
        }
        return;
    }

    if (!hasEnabledReminder) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        return;
    }

    await ensureNotificationPermission();
    await Notifications.cancelAllScheduledNotificationsAsync();

    try {
        if (reminders.waterEnabled) {
            for (
                let hour = WATER_START_HOUR;
                hour <= WATER_END_HOUR;
                hour += reminders.waterIntervalHours
            ) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Hora de beber água",
                        body: "Faz uma pausa e regista um copo de água.",
                        data: { kind: "water-reminder" },
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DAILY,
                        hour,
                        minute: 0,
                        channelId: CHANNEL_ID,
                    },
                });
            }
        }

        if (reminders.mealEnabled) {
            for (const time of reminders.mealTimes) {
                const [hour, minute] = time.split(":").map(Number);
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Regista a tua refeição",
                        body: "Mantém o teu diário alimentar atualizado.",
                        data: { kind: "meal-reminder" },
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DAILY,
                        hour,
                        minute,
                        channelId: CHANNEL_ID,
                    },
                });
            }
        }
    } catch (error) {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (cleanupError) {
            console.error("Could not clear partially scheduled Ritmo reminders.", cleanupError);
        }
        throw error;
    }
}
