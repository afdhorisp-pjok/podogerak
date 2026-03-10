# Variable Definitions for Statistical Analysis

## Raw Data Variables (CSV Export)

| Variable | Type | Description |
|----------|------|-------------|
| `session_log_id` | UUID | Unique identifier for each session log entry |
| `participant_id` | UUID | Internal participant identifier |
| `allocation_code` | String | Blinded allocation code (e.g., EXP-A1B2) |
| `stratum` | String | Stratification variable (e.g., school/class) |
| `arm` | String | Treatment arm assignment (e.g., control, intervention_a) |
| `start_timestamp` | ISO 8601 | Session start time |
| `end_timestamp` | ISO 8601 | Session end time (may be null) |
| `duration_seconds` | Integer | Session duration in seconds |
| `teacher_rating` | Integer (0–5) | Teacher fidelity rating: 0=not observed, 1=poor, 2=below average, 3=average, 4=good, 5=excellent |
| `completion_flag` | Boolean (0/1) | Whether session was completed as planned |

## Computed Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| `fidelity_score` | Mean of `teacher_rating` across all sessions for a participant or experiment | Overall implementation fidelity indicator |
| `weekly_completion_rate` | `completed_sessions / total_sessions × 100` per ISO week | Adherence metric |
| `consecutive_misses` | Count of consecutive weeks without any logged session from most recent | Used for auto-flagging (threshold: ≥3) |

## Aggregated Report Columns

| Column | Description |
|--------|-------------|
| `arm` | Treatment arm name |
| `n` | Number of participants in arm |
| `sessions_completed` | Total completed sessions in arm |
| `mean_duration` | Mean session duration (seconds) |
| `sd_duration` | Standard deviation of session duration |
| `mean_rating` | Mean teacher fidelity rating |
| `sd_rating` | Standard deviation of teacher rating |
| `t_stat` | Independent samples t-statistic comparing arm vs control on duration: `t = (M₁ - M₂) / √(SD₁²/N₁ + SD₂²/N₂)` |
| `p_value` | Placeholder — compute externally using appropriate statistical software |

## Consent Record Variables (CSV Export)

| Variable | Type | Description |
|----------|------|-------------|
| `participant_id` | UUID | Links consent to experiment participant (via `child_user_id` → `experiment_participants.user_id`) |
| `school` | String | School/class stratum from experiment enrollment (`experiment_participants.stratum`) |
| `timestamp` | ISO 8601 | When consent was granted (`granted_at`) |
| `consent_version` | String | Version of consent form (e.g., v1.0) |
| `sensor_permission` | Boolean (0/1) | Whether sensor data collection was permitted |
| `video_permission` | Boolean (0/1) | Whether video upload was permitted |
| `audio_permission` | Boolean (0/1) | Whether audio recording was permitted |
| `device_type` | String | Device/browser user agent at time of export |

## Notes

- **Randomization**: Uses stratified block randomization with a deterministic seed. The `randomize_participant` function ensures balanced allocation within each stratum.
- **Blinding**: `allocation_code` can be used for blinded analysis. Arm assignments should be unblinded only after primary analysis.
- **Missing Data**: Null values in `duration_seconds` or `teacher_rating` indicate the field was not recorded. Handle per your analysis plan.
- **t-test**: The provided t-statistic is a Welch's t-test approximation. For publication, use a dedicated statistical package (R, SPSS, Stata) for proper degrees of freedom and p-values.
