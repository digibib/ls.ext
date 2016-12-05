module.exports.patronSettingsToKohaSettings = patronSettings => {
  return {
    item_due: {},
    advance_notice: {
      days_in_advance: 2,
      transports: patronSettingToArray(patronSettings.alerts.reminderOfDueDate),
      wants_digest: true
    },
    hold_filled: {
      transports: patronSettingToArray(patronSettings.alerts.reminderOfPickup),
      wants_digest: false
    },
    item_checkout: {
      transports: patronSettingToArray(patronSettings.receipts.loans)
    },
    item_check_in: {
      transports: patronSettingToArray(patronSettings.receipts.returns)
    }
  }
}

module.exports.kohaSettingsToPatronSettings = kohaSettings => {
  return {
    alerts: {
      reminderOfDueDate: kohaSettingToObject(kohaSettings.advance_notice),
      reminderOfPickup: kohaSettingToObject(kohaSettings.hold_filled)
    },
    receipts: {
      loans: kohaSettingToObject(kohaSettings.item_checkout),
      returns: kohaSettingToObject(kohaSettings.item_check_in)
    }
  }
}

function kohaSettingToObject (kohaSetting) {
  return {
    email: kohaSetting && kohaSetting.transports && kohaSetting.transports.email && true,
    sms: kohaSetting && kohaSetting.transports && kohaSetting.transports.sms && true
  }
}

function patronSettingToArray (patronSetting) {
  const out = []
  if (patronSetting.email) {
    out.push('email')
  }
  if (patronSetting.sms) {
    out.push('sms')
  }
  return out.length > 0 ? out : undefined
}
