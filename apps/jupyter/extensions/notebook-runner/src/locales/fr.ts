import { MessageKeys } from "../translator";

type Messages = {
  [K in (typeof MessageKeys)[keyof typeof MessageKeys]]: string;
};

export const frMessages: Messages = {
  "useEmbeddedPython.cannotLoadProject":
    "Impossible de charger le projet : {error}",
  "useEmbeddedPython.cannotSaveProject":
    "Impossible d'enregistrer le projet : {error}",
  "useEmbeddedPython.cannotImportTask":
    "Impossible d'importer la tâche : {error}",
  "useEmbeddedPython.cannotGetTask":
    "Impossible de récupérer la tâche : {error}",
  "useEmbeddedPython.submissionLoaded": "Soumission chargée avec succès",
  "useEmbeddedPython.taskCreated": "Tâche créée avec succès",
  "useEmbeddedPython.taskImported": "Tâche importée avec succès",
  "useEmbeddedPython.taskLoaded": "Tâche chargée avec succès",
  "useEmbeddedPython.cannotImportExternalInNonEditMode":
    "Impossible d'importer des tâches externes en mode non-édition",
  "useEmbeddedPython.exportError":
    "Échec de l'exportation de la tâche : {error}",
};
