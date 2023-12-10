const MemberCategories = require("../models/MemberCategories");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");
const { slugify } = require("transliteration");
const { valueRequired } = require("../lib/check");

exports.createMenu = asyncHandler(async (req, res, next) => {
  const parentId = req.body.parentId || null;
  const name = req.body.name;
  let position = 0;

  if (parentId) {
    const category = await MemberCategories.findOne({ parentId }).sort({
      position: -1,
    });
    if (category) {
      position = category.position + 1;
    }
  } else {
    const category = await MemberCategories.findOne({ parentId: null }).sort({
      position: -1,
    });
    if (category) {
      position = category.position + 1;
    }
  }
  req.body.position = position;

  const nameUnique = await MemberCategories.find({}).where("name").equals(name);
  if (nameUnique.length > 0) {
    req.body.slug =
      nameUnique[nameUnique.length - 1].slug +
      (nameUnique.length + 1).toString();
  }

  const category = await MemberCategories.create(req.body);
  res.status(200).json({
    success: true,
    data: category,
  });
});

function createCategories(categories, parentId = null) {
  const categoryList = [];
  let category = null;

  if (parentId === null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      value: cate._id,
      title: cate.name,
      slug: cate.slug,
      position: cate.position,
      children: createCategories(categories, cate._id),
    });
  }

  return categoryList;
}

exports.getMenus = asyncHandler(async (req, res, next) => {
  MemberCategories.find({})
    .sort({ position: 1 })
    .exec((error, categories) => {
      if (error)
        return res.status(400).json({
          success: false,
          error,
        });
      if (categories) {
        const categoryList = createCategories(categories);

        res.status(200).json({
          success: true,
          data: categoryList,
        });
      }
    });
});

exports.getMenu = asyncHandler(async (req, res, next) => {
  let menu = "";
  if (req.query && req.query.direct) {
    menu = await MemberCategories.findOne({ direct: `/${req.query.direct}` });
  } else {
    menu = await MemberCategories.findById(req.params.id);
  }

  if (!menu) {
    throw new MyError(" Тус ангилал олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: menu,
  });
});

const parentCheck = (menus) => {
  menus.map(async (menu) => {
    const result = await MemberCategories.find({ parentId: menu._id });
    if (result && result.length > 0) {
      parentCheck(result);
    }
    await MemberCategories.findByIdAndDelete(menu._id);
  });
};

exports.deleteMenu = asyncHandler(async (req, res, next) => {
  const category = await MemberCategories.findById(req.params.id);
  if (!category) {
    throw new MyError(req.params.id + " ангилал олдсонгүй", 404);
  }
  const parentMenus = await MemberCategories.find({ parentId: req.params.id });

  if (parentMenus) {
    parentCheck(parentMenus);
  }

  category.remove();

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.changePosition = asyncHandler(async (req, res) => {
  const menus = req.body.data;

  if (!menus && menus.length > 0) {
    throw new MyError("Дата илгээгүй байна дахин шалгана уу", 404);
  }

  const positionChange = (categories, pKey = null) => {
    if (categories) {
      categories.map(async (el, index) => {
        const data = {
          position: index,
          parentId: pKey,
        };
        await MemberCategories.findByIdAndUpdate(el.key, data);
        if (el.children && el.children.length > 0) {
          const parentKey = el.key;
          positionChange(el.children, parentKey);
        }
      });
    }
  };

  positionChange(menus);

  res.status(200).json({
    success: true,
  });
});

exports.updateMenu = asyncHandler(async (req, res) => {
  if (!valueRequired(req.body.name)) {
    throw new MyError("Талбарыг бөгөлнө үү", 400);
  }

  const result = await MemberCategories.findById(req.params.id);

  if (!result) {
    throw new MyError("Өгөгдөл олдсонгүй дахин оролдоно үү", 404);
  }

  const name = req.body.name;

  const nameUnique = await MemberCategories.find({}).where("name").equals(name);

  if (nameUnique.length > 0) {
    req.body.slug =
      nameUnique[nameUnique.length - 1].slug +
      (nameUnique.length + 1).toString();
  } else {
    req.body.slug = slugify(name);
  }

  const category = await MemberCategories.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!category) {
    throw new MyError("Ангилалын нэр солигдсонгүй", 400);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});
