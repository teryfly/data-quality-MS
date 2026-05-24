import { authHandlers } from './auth.js'
import { datasourceHandlers } from './datasource.js'
import { datasetHandlers } from './dataset.js'
import { ruleHandlers } from './rule.js'
import { templateHandlers } from './template.js'
import { executeHandlers } from './execute.js'
import { resultHandlers } from './result.js'
import { reportHandlers } from './report.js'
import { uploadHandlers } from './upload.js'
import { systemHandlers } from './system.js'
import { codesetHandlers } from './codeset.js'
import { notificationHandlers } from './notification.js'

export const allHandlers = [
  ...authHandlers,
  ...datasourceHandlers,
  ...datasetHandlers,
  ...ruleHandlers,
  ...templateHandlers,
  ...executeHandlers,
  ...resultHandlers,
  ...reportHandlers,
  ...uploadHandlers,
  ...systemHandlers,
  ...codesetHandlers,
  ...notificationHandlers
]
