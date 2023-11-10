import { useState } from "react";
import { toggleNoAIHelpHistory } from "../plus/common/api";
import {
  TOGGLE_PLUS_AI_HELP_HISTORY_DISABLED,
  TOGGLE_PLUS_AI_HELP_HISTORY_ENABLED,
} from "../telemetry/constants";
import { useGleanClick } from "../telemetry/glean-context";
import { Spinner } from "../ui/atoms/spinner";
import { Switch } from "../ui/atoms/switch";
import { useUserData } from "../user-context";

export function ManageAIHelp() {
  const [saving, setSaving] = useState<boolean>(false);
  const user = useUserData();
  const gleanClick = useGleanClick();

  return (
    <section className="field-group">
      <h2>AI Help</h2>
      <ul>
        <li>
          <h3>Disable AI Help history</h3>
          <span>Some copy about disabling AI Help history 🤷</span>
          {saving ? (
            <Spinner extraClasses="loading" />
          ) : (
            <Switch
              name="no_ai_help_history"
              checked={Boolean(user?.settings?.noAIHelpHistory)}
              toggle={async (e) => {
                setSaving(true);
                const checked = Boolean(e.target.checked);
                const source = checked
                  ? TOGGLE_PLUS_AI_HELP_HISTORY_ENABLED
                  : TOGGLE_PLUS_AI_HELP_HISTORY_DISABLED;
                gleanClick(source);
                await toggleNoAIHelpHistory(checked);
                if (user?.settings) {
                  user.settings.noAds = checked;
                }
                user?.mutate?.();
                setSaving(false);
              }}
            ></Switch>
          )}
        </li>
        <li>
          <span>Some copy about deleting AI Help history 🤷</span>
          <button
            onClick={async () => {
              if (
                window.confirm(
                  "Do you want to permanently delete your AI Help history?"
                )
              ) {
                await fetch("/api/v1/plus/ai/help/history/list", {
                  method: "DELETE",
                });
              }
            }}
          >
            Delete
          </button>
        </li>
      </ul>
    </section>
  );
}