const MessageBuilder = {
    Error: function (message, section) {
      return FunctionResultMessage.new({ Message: message, Type: FunctionResultMessageTypes.Error, Section: section })
    },
  
    Warning: function (message, section) {
      return FunctionResultMessage.new({ Message: message, Type: FunctionResultMessageTypes.Warning, Section: section })
    },
  
    Info: function (message, section) {
      return FunctionResultMessage.new({ Message: message, Type: FunctionResultMessageTypes.Info, Section: section })
    },
  
    Rule: function (message, field, section) {
      return FunctionResultMessage.new({ Message: message, Type: FunctionResultMessageTypes.Rule, Field: field, Section: section })
    },
  
    Authorization: function (message) {
      return FunctionResultMessage.new({ Message: message, Type: FunctionResultMessageTypes.Authorization })
    },
  
    Authentication: function (message) {
      return FunctionResultMessage.new({ Message: message, Type: FunctionResultMessageTypes.Authentication })
    },
  
    ModelFieldTypeError: function (message) {
      return FunctionResultMessage.new({ Message: message, Type: FunctionResultMessageTypes.ModelFieldTypeError })
    },
  
    DocumentAnalysis: function (message, analysisType, section, field) {
      return FunctionResultMessage.new({ Message: message, Type: FunctionResultMessageTypes.DocumentAnalysis, Field: field, Section: section, AnalysisType: analysisType })
    }
  }

  module.exports = MessageBuilder
  