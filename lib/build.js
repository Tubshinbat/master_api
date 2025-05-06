const User = require("../models/User");
const { isValidInput } = require("./check");
const { RegexOptions } = require("./searchOfterModel");

// 2025 01 18 -- new Functions

exports.validateStringFields = (req, userInput, strFields) => {
  if (isValidInput(strFields)) {
    strFields.forEach((path) => {
      if (!isValidInput(userInput[path])) {
        delete req.body[path];
      }
    });
  }
};

exports.validateStringFieldsFull = (req, userInput, strFields) => {
  if (isValidInput(strFields)) {
    strFields.forEach((path) => {
      if (!isValidInput(userInput[path])) {
        req.body[path] = null;
      }
    });
  }
};

exports.setLanguageFields = (req, userInput, languageFields, language) => {
  req.body.languages = {
    [language]: Object.fromEntries(
      languageFields.map((field) => [field, userInput[field]])
    ),
  };
};

exports.applyFilters = (query, userInput, languageFields) => {
  languageFields.forEach((field) => {
    if (isValidInput(userInput[field])) {
      query.or([
        ...this.supportLanguage.map((lanCode) => ({
          [`languages.${lanCode}.${field}`]: RegexOptions(userInput[field]),
        })),
      ]);
    }
  });
};

exports.filterPaths = (query, userInput, paths) => {
  paths.forEach((path) => {
    if (isValidInput(userInput[path])) {
      query.where({ path: RegexOptions(userInput[path]) });
    }
  });
};

exports.applyUserQuery = async (query, field, userId) => {
  if (isValidInput(userId)) {
    const userData = await User.find({ name: RegexOptions(userId) }).select(
      "_id"
    );
    if (userData) query.where(field).in(userData);
  }
};

exports.tourSearch = async (name) => {
  const searchConditions = this.supportLanguage.map((lanCode) => ({
    [`languages.${lanCode}.name`]: RegexOptions(name),
  }));

  const result = await Tour.find({ $or: searchConditions }).select("_id");
  return result;
};

// ----------------------------

exports.applyStatusQuery = (query, status) => {
  if (isValidInput(status)) {
    const statusArray = status.split(",");
    if (statusArray.length > 1) {
      query.where("status").in(statusArray);
    } else {
      query.where("status").equals(status);
    }
  }
};

exports.applyBooleanQuery = (query, value, path) => {
  if (isValidInput(value)) {
    const values = value.split(",").map((val) => val.trim());
    if (values.length > 1) {
      query.where(path).in(values);
    } else {
      query.where(path).equals(values[0]);
    }
  }
};

exports.applyStarQuery = (query, star) => {
  if (isValidInput(star)) {
    const starArray = star.split(",");
    if (starArray.length > 1) {
      query.where("star").in(starArray);
    } else {
      query.where("star").equals(star);
    }
  }
};

exports.checkAndAssign = (value) =>
  isValidInput(value) && value.length > 0 ? value : [];

exports.sortBuild = (sort, sortDefault) => {
  if (typeof sort !== "string") {
    return sortDefault;
  }

  const [field, order] = sort.split(":");

  if (!isValidInput(order) || !isValidInput(field)) {
    return sortDefault;
  }

  return {
    [field]: order === "ascend" ? 1 : -1,
  };
};

exports.supportLanguage = ["mn", "en", "es", "fr", "cn"];

exports.getLanguagePaths = (model) => {
  const schema = model.schema.obj;

  // languages доторх талбаруудын нэрсийг буцаана
  if (schema.languages) {
    return Object.keys(schema.languages.of.obj);
  }

  return [];
};

exports.getModelPaths = (model) => {
  const modelPaths = Object.keys(model.schema.obj);
  const deleteFields = [
    "createUser",
    "updateUser",
    "createAt",
    "updateAt",
    "picture",
    "cover",
    "icon",
    "pictures",
    "program",
    "password",
    "status",
    "categories",
    "all",
    "views",
    "star",
    "role",
    "newsActive",
    "listActive",
    "pageParentActive",
    "modelActive",
    "languages",
    "pageActive",
    "isDirect",
    "type",
    "password",
    "cityProvince",
    "isAddress",
    "cityId",
    "districtId",
    "placeId",
    "khorooId",
    "searchText",
    "categoryId",
  ];
  return modelPaths.filter((path) => !deleteFields.includes(path));
};
