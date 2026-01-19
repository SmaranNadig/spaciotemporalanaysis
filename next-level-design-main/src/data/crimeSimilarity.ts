// Crime type similarity mappings
export const crimeSimilarity: Record<string, string[]> = {
  "THEFT": [
    "ROBBERY",
    "BURGLARY",
    "MOTOR VEHICLE THEFT",
    "FRAUD"
  ],
  "ROBBERY": [
    "THEFT",
    "BURGLARY",
    "ASSAULT"
  ],
  "BURGLARY": [
    "THEFT",
    "ROBBERY",
    "MOTOR VEHICLE THEFT",
    "CRIMINAL TRESPASS"
  ],
  "ASSAULT": [
    "BATTERY",
    "ROBBERY",
    "WEAPONS"
  ],
  "BATTERY": [
    "ASSAULT",
    "HOMICIDE"
  ],
  "NARCOTICS": [
    "OTHER NARCOTIC VIOLATION"
  ],
  "MOTOR VEHICLE THEFT": [
    "THEFT",
    "BURGLARY"
  ],
  "VANDALISM": [
    "CRIMINAL DAMAGE",
    "CRIMINAL TRESPASS"
  ],
  "FRAUD": [
    "THEFT",
    "IDENTITY THEFT",
    "DECEPTIVE PRACTICE"
  ],
  "WEAPONS": [
    "ASSAULT",
    "HOMICIDE"
  ]
};
