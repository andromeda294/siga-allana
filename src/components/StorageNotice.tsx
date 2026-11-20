import { useThemeStyles } from "@/styles/useThemeStyles";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { StyleSheet, Text, View } from "react-native";

type StorageNoticeProps = {
    message: string | null;
};

export default function StorageNotice({ message }: StorageNoticeProps) {
    const styles = useThemeStyles(createStyles);
    if (!message) return null;

    return (
        <View accessibilityRole="alert" style={styles.notice}>
            <Text style={styles.text}>{message} As alterações atuais podem não ficar guardadas.</Text>
        </View>
    );
}

function createStyles(colors: ReturnType<typeof useAppSettings>["colors"]) {
    return StyleSheet.create({
    notice: {
        backgroundColor: colors.surfaceRaised,
        borderColor: colors.danger,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 18,
        padding: 12,
    },
    text: {
        color: colors.danger,
        fontSize: 12,
        lineHeight: 18,
    },
    });
}
