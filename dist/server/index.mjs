import express, { Router } from "express";
import cors from "cors";
import * as path from "path";
import path__default from "path";
import * as fs from "fs";
import fs__default from "fs";
import { fileURLToPath } from "url";
import require$$0$4 from "type-is";
import require$$0 from "stream";
import require$$0$1 from "events";
import require$$0$2 from "util";
import require$$0$3 from "object-assign";
import require$$1 from "os";
import require$$3 from "crypto";
import require$$0$6 from "safe-buffer";
import require$$0$5 from "buffer";
import require$$2 from "inherits";
import require$$3$1 from "util-deprecate";
function handleDemo(req, res) {
  res.json({ message: "Demo endpoint working!" });
}
const __filename$6 = fileURLToPath(import.meta.url);
const __dirname$7 = path.dirname(__filename$6);
const router$7 = Router();
const ordersFilePath = path.join(__dirname$7, "../data/orders.json");
const readOrders = () => {
  const data = fs.readFileSync(ordersFilePath, "utf8");
  return JSON.parse(data);
};
const writeOrders = (orders) => {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), "utf8");
};
router$7.get("/", (req, res) => {
  try {
    const orders = readOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error reading orders data" });
  }
});
router$7.get("/:id", (req, res) => {
  try {
    const orders = readOrders();
    const order = orders.find((o) => o.id === req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error reading order data" });
  }
});
router$7.post("/", (req, res) => {
  try {
    const orders = readOrders();
    const { customer, product, quantity, colors, deadline, price } = req.body;
    if (!customer || !product || !quantity || !colors || !deadline || !price) {
      return res.status(400).json({
        message: "Missing required fields: customer, product, quantity, colors, deadline, price"
      });
    }
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: newOrderId,
      customer: customer.trim(),
      product: product.trim(),
      quantity: quantity.trim(),
      colors: colors.trim(),
      deadline,
      total: parseFloat(price) || 0,
      deposit: parseFloat(req.body.deposit) || 0,
      remaining: (parseFloat(price) || 0) - (parseFloat(req.body.deposit) || 0),
      status: "pending",
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      notes: req.body.notes || "",
      paymentMethod: req.body.paymentMethod || "Pending",
      items: 1,
      completedStages: [1],
      // Start with first stage completed
      currentStage: "Sent to Dyeing",
      timelineNotes: {}
    };
    orders.push(newOrder);
    writeOrders(orders);
    console.log("New order created:", newOrder.id);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error: String(error) });
  }
});
router$7.put("/:id", (req, res) => {
  try {
    let orders = readOrders();
    const index = orders.findIndex((o) => o.id === req.params.id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...req.body };
      writeOrders(orders);
      res.json(orders[index]);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating order" });
  }
});
router$7.delete("/:id", (req, res) => {
  try {
    let orders = readOrders();
    const initialLength = orders.length;
    orders = orders.filter((o) => o.id !== req.params.id);
    if (orders.length < initialLength) {
      writeOrders(orders);
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting order" });
  }
});
router$7.post("/:id/timeline-note", (req, res) => {
  try {
    const orders = readOrders();
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const { stepId, note } = req.body;
    if (!stepId || !note) {
      return res.status(400).json({ message: "Step ID and note are required" });
    }
    if (!order.timelineNotes) {
      order.timelineNotes = {};
    }
    order.timelineNotes[stepId] = note;
    writeOrders(orders);
    res.json({ message: "Note added successfully", order });
  } catch (error) {
    console.error("Error adding timeline note:", error);
    res.status(500).json({ message: "Error adding timeline note" });
  }
});
router$7.put("/:id/progress", (req, res) => {
  try {
    const orders = readOrders();
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const { currentStage, status, completedStages } = req.body;
    if (currentStage) order.currentStage = currentStage;
    if (status) order.status = status;
    if (completedStages) order.completedStages = completedStages;
    order.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
    writeOrders(orders);
    res.json({ message: "Order progress updated successfully", order });
  } catch (error) {
    console.error("Error updating order progress:", error);
    res.status(500).json({ message: "Error updating order progress" });
  }
});
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var multer$1 = { exports: {} };
var utils;
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils;
  hasRequiredUtils = 1;
  function parseContentType(str) {
    if (str.length === 0)
      return;
    const params = /* @__PURE__ */ Object.create(null);
    let i = 0;
    for (; i < str.length; ++i) {
      const code = str.charCodeAt(i);
      if (TOKEN[code] !== 1) {
        if (code !== 47 || i === 0)
          return;
        break;
      }
    }
    if (i === str.length)
      return;
    const type = str.slice(0, i).toLowerCase();
    const subtypeStart = ++i;
    for (; i < str.length; ++i) {
      const code = str.charCodeAt(i);
      if (TOKEN[code] !== 1) {
        if (i === subtypeStart)
          return;
        if (parseContentTypeParams(str, i, params) === void 0)
          return;
        break;
      }
    }
    if (i === subtypeStart)
      return;
    const subtype = str.slice(subtypeStart, i).toLowerCase();
    return { type, subtype, params };
  }
  function parseContentTypeParams(str, i, params) {
    while (i < str.length) {
      for (; i < str.length; ++i) {
        const code = str.charCodeAt(i);
        if (code !== 32 && code !== 9)
          break;
      }
      if (i === str.length)
        break;
      if (str.charCodeAt(i++) !== 59)
        return;
      for (; i < str.length; ++i) {
        const code = str.charCodeAt(i);
        if (code !== 32 && code !== 9)
          break;
      }
      if (i === str.length)
        return;
      let name;
      const nameStart = i;
      for (; i < str.length; ++i) {
        const code = str.charCodeAt(i);
        if (TOKEN[code] !== 1) {
          if (code !== 61)
            return;
          break;
        }
      }
      if (i === str.length)
        return;
      name = str.slice(nameStart, i);
      ++i;
      if (i === str.length)
        return;
      let value = "";
      let valueStart;
      if (str.charCodeAt(i) === 34) {
        valueStart = ++i;
        let escaping = false;
        for (; i < str.length; ++i) {
          const code = str.charCodeAt(i);
          if (code === 92) {
            if (escaping) {
              valueStart = i;
              escaping = false;
            } else {
              value += str.slice(valueStart, i);
              escaping = true;
            }
            continue;
          }
          if (code === 34) {
            if (escaping) {
              valueStart = i;
              escaping = false;
              continue;
            }
            value += str.slice(valueStart, i);
            break;
          }
          if (escaping) {
            valueStart = i - 1;
            escaping = false;
          }
          if (QDTEXT[code] !== 1)
            return;
        }
        if (i === str.length)
          return;
        ++i;
      } else {
        valueStart = i;
        for (; i < str.length; ++i) {
          const code = str.charCodeAt(i);
          if (TOKEN[code] !== 1) {
            if (i === valueStart)
              return;
            break;
          }
        }
        value = str.slice(valueStart, i);
      }
      name = name.toLowerCase();
      if (params[name] === void 0)
        params[name] = value;
    }
    return params;
  }
  function parseDisposition(str, defDecoder) {
    if (str.length === 0)
      return;
    const params = /* @__PURE__ */ Object.create(null);
    let i = 0;
    for (; i < str.length; ++i) {
      const code = str.charCodeAt(i);
      if (TOKEN[code] !== 1) {
        if (parseDispositionParams(str, i, params, defDecoder) === void 0)
          return;
        break;
      }
    }
    const type = str.slice(0, i).toLowerCase();
    return { type, params };
  }
  function parseDispositionParams(str, i, params, defDecoder) {
    while (i < str.length) {
      for (; i < str.length; ++i) {
        const code = str.charCodeAt(i);
        if (code !== 32 && code !== 9)
          break;
      }
      if (i === str.length)
        break;
      if (str.charCodeAt(i++) !== 59)
        return;
      for (; i < str.length; ++i) {
        const code = str.charCodeAt(i);
        if (code !== 32 && code !== 9)
          break;
      }
      if (i === str.length)
        return;
      let name;
      const nameStart = i;
      for (; i < str.length; ++i) {
        const code = str.charCodeAt(i);
        if (TOKEN[code] !== 1) {
          if (code === 61)
            break;
          return;
        }
      }
      if (i === str.length)
        return;
      let value = "";
      let valueStart;
      let charset;
      name = str.slice(nameStart, i);
      if (name.charCodeAt(name.length - 1) === 42) {
        const charsetStart = ++i;
        for (; i < str.length; ++i) {
          const code = str.charCodeAt(i);
          if (CHARSET[code] !== 1) {
            if (code !== 39)
              return;
            break;
          }
        }
        if (i === str.length)
          return;
        charset = str.slice(charsetStart, i);
        ++i;
        for (; i < str.length; ++i) {
          const code = str.charCodeAt(i);
          if (code === 39)
            break;
        }
        if (i === str.length)
          return;
        ++i;
        if (i === str.length)
          return;
        valueStart = i;
        let encode = 0;
        for (; i < str.length; ++i) {
          const code = str.charCodeAt(i);
          if (EXTENDED_VALUE[code] !== 1) {
            if (code === 37) {
              let hexUpper;
              let hexLower;
              if (i + 2 < str.length && (hexUpper = HEX_VALUES[str.charCodeAt(i + 1)]) !== -1 && (hexLower = HEX_VALUES[str.charCodeAt(i + 2)]) !== -1) {
                const byteVal = (hexUpper << 4) + hexLower;
                value += str.slice(valueStart, i);
                value += String.fromCharCode(byteVal);
                i += 2;
                valueStart = i + 1;
                if (byteVal >= 128)
                  encode = 2;
                else if (encode === 0)
                  encode = 1;
                continue;
              }
              return;
            }
            break;
          }
        }
        value += str.slice(valueStart, i);
        value = convertToUTF8(value, charset, encode);
        if (value === void 0)
          return;
      } else {
        ++i;
        if (i === str.length)
          return;
        if (str.charCodeAt(i) === 34) {
          valueStart = ++i;
          let escaping = false;
          for (; i < str.length; ++i) {
            const code = str.charCodeAt(i);
            if (code === 92) {
              if (escaping) {
                valueStart = i;
                escaping = false;
              } else {
                value += str.slice(valueStart, i);
                escaping = true;
              }
              continue;
            }
            if (code === 34) {
              if (escaping) {
                valueStart = i;
                escaping = false;
                continue;
              }
              value += str.slice(valueStart, i);
              break;
            }
            if (escaping) {
              valueStart = i - 1;
              escaping = false;
            }
            if (QDTEXT[code] !== 1)
              return;
          }
          if (i === str.length)
            return;
          ++i;
        } else {
          valueStart = i;
          for (; i < str.length; ++i) {
            const code = str.charCodeAt(i);
            if (TOKEN[code] !== 1) {
              if (i === valueStart)
                return;
              break;
            }
          }
          value = str.slice(valueStart, i);
        }
        value = defDecoder(value, 2);
        if (value === void 0)
          return;
      }
      name = name.toLowerCase();
      if (params[name] === void 0)
        params[name] = value;
    }
    return params;
  }
  function getDecoder(charset) {
    let lc;
    while (true) {
      switch (charset) {
        case "utf-8":
        case "utf8":
          return decoders.utf8;
        case "latin1":
        case "ascii":
        // TODO: Make these a separate, strict decoder?
        case "us-ascii":
        case "iso-8859-1":
        case "iso8859-1":
        case "iso88591":
        case "iso_8859-1":
        case "windows-1252":
        case "iso_8859-1:1987":
        case "cp1252":
        case "x-cp1252":
          return decoders.latin1;
        case "utf16le":
        case "utf-16le":
        case "ucs2":
        case "ucs-2":
          return decoders.utf16le;
        case "base64":
          return decoders.base64;
        default:
          if (lc === void 0) {
            lc = true;
            charset = charset.toLowerCase();
            continue;
          }
          return decoders.other.bind(charset);
      }
    }
  }
  const decoders = {
    utf8: (data, hint) => {
      if (data.length === 0)
        return "";
      if (typeof data === "string") {
        if (hint < 2)
          return data;
        data = Buffer.from(data, "latin1");
      }
      return data.utf8Slice(0, data.length);
    },
    latin1: (data, hint) => {
      if (data.length === 0)
        return "";
      if (typeof data === "string")
        return data;
      return data.latin1Slice(0, data.length);
    },
    utf16le: (data, hint) => {
      if (data.length === 0)
        return "";
      if (typeof data === "string")
        data = Buffer.from(data, "latin1");
      return data.ucs2Slice(0, data.length);
    },
    base64: (data, hint) => {
      if (data.length === 0)
        return "";
      if (typeof data === "string")
        data = Buffer.from(data, "latin1");
      return data.base64Slice(0, data.length);
    },
    other: (data, hint) => {
      if (data.length === 0)
        return "";
      if (typeof data === "string")
        data = Buffer.from(data, "latin1");
      try {
        const decoder = new TextDecoder(this);
        return decoder.decode(data);
      } catch {
      }
    }
  };
  function convertToUTF8(data, charset, hint) {
    const decode = getDecoder(charset);
    if (decode)
      return decode(data, hint);
  }
  function basename(path2) {
    if (typeof path2 !== "string")
      return "";
    for (let i = path2.length - 1; i >= 0; --i) {
      switch (path2.charCodeAt(i)) {
        case 47:
        // '/'
        case 92:
          path2 = path2.slice(i + 1);
          return path2 === ".." || path2 === "." ? "" : path2;
      }
    }
    return path2 === ".." || path2 === "." ? "" : path2;
  }
  const TOKEN = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  const QDTEXT = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1
  ];
  const CHARSET = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  const EXTENDED_VALUE = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  const HEX_VALUES = [
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    10,
    11,
    12,
    13,
    14,
    15,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    10,
    11,
    12,
    13,
    14,
    15,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1
  ];
  utils = {
    basename,
    convertToUTF8,
    getDecoder,
    parseContentType,
    parseDisposition
  };
  return utils;
}
var sbmh;
var hasRequiredSbmh;
function requireSbmh() {
  if (hasRequiredSbmh) return sbmh;
  hasRequiredSbmh = 1;
  function memcmp(buf1, pos1, buf2, pos2, num) {
    for (let i = 0; i < num; ++i) {
      if (buf1[pos1 + i] !== buf2[pos2 + i])
        return false;
    }
    return true;
  }
  class SBMH {
    constructor(needle, cb) {
      if (typeof cb !== "function")
        throw new Error("Missing match callback");
      if (typeof needle === "string")
        needle = Buffer.from(needle);
      else if (!Buffer.isBuffer(needle))
        throw new Error(`Expected Buffer for needle, got ${typeof needle}`);
      const needleLen = needle.length;
      this.maxMatches = Infinity;
      this.matches = 0;
      this._cb = cb;
      this._lookbehindSize = 0;
      this._needle = needle;
      this._bufPos = 0;
      this._lookbehind = Buffer.allocUnsafe(needleLen);
      this._occ = [
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen,
        needleLen
      ];
      if (needleLen > 1) {
        for (let i = 0; i < needleLen - 1; ++i)
          this._occ[needle[i]] = needleLen - 1 - i;
      }
    }
    reset() {
      this.matches = 0;
      this._lookbehindSize = 0;
      this._bufPos = 0;
    }
    push(chunk, pos) {
      let result;
      if (!Buffer.isBuffer(chunk))
        chunk = Buffer.from(chunk, "latin1");
      const chunkLen = chunk.length;
      this._bufPos = pos || 0;
      while (result !== chunkLen && this.matches < this.maxMatches)
        result = feed(this, chunk);
      return result;
    }
    destroy() {
      const lbSize = this._lookbehindSize;
      if (lbSize)
        this._cb(false, this._lookbehind, 0, lbSize, false);
      this.reset();
    }
  }
  function feed(self2, data) {
    const len = data.length;
    const needle = self2._needle;
    const needleLen = needle.length;
    let pos = -self2._lookbehindSize;
    const lastNeedleCharPos = needleLen - 1;
    const lastNeedleChar = needle[lastNeedleCharPos];
    const end = len - needleLen;
    const occ = self2._occ;
    const lookbehind = self2._lookbehind;
    if (pos < 0) {
      while (pos < 0 && pos <= end) {
        const nextPos = pos + lastNeedleCharPos;
        const ch = nextPos < 0 ? lookbehind[self2._lookbehindSize + nextPos] : data[nextPos];
        if (ch === lastNeedleChar && matchNeedle(self2, data, pos, lastNeedleCharPos)) {
          self2._lookbehindSize = 0;
          ++self2.matches;
          if (pos > -self2._lookbehindSize)
            self2._cb(true, lookbehind, 0, self2._lookbehindSize + pos, false);
          else
            self2._cb(true, void 0, 0, 0, true);
          return self2._bufPos = pos + needleLen;
        }
        pos += occ[ch];
      }
      while (pos < 0 && !matchNeedle(self2, data, pos, len - pos))
        ++pos;
      if (pos < 0) {
        const bytesToCutOff = self2._lookbehindSize + pos;
        if (bytesToCutOff > 0) {
          self2._cb(false, lookbehind, 0, bytesToCutOff, false);
        }
        self2._lookbehindSize -= bytesToCutOff;
        lookbehind.copy(lookbehind, 0, bytesToCutOff, self2._lookbehindSize);
        lookbehind.set(data, self2._lookbehindSize);
        self2._lookbehindSize += len;
        self2._bufPos = len;
        return len;
      }
      self2._cb(false, lookbehind, 0, self2._lookbehindSize, false);
      self2._lookbehindSize = 0;
    }
    pos += self2._bufPos;
    const firstNeedleChar = needle[0];
    while (pos <= end) {
      const ch = data[pos + lastNeedleCharPos];
      if (ch === lastNeedleChar && data[pos] === firstNeedleChar && memcmp(needle, 0, data, pos, lastNeedleCharPos)) {
        ++self2.matches;
        if (pos > 0)
          self2._cb(true, data, self2._bufPos, pos, true);
        else
          self2._cb(true, void 0, 0, 0, true);
        return self2._bufPos = pos + needleLen;
      }
      pos += occ[ch];
    }
    while (pos < len) {
      if (data[pos] !== firstNeedleChar || !memcmp(data, pos, needle, 0, len - pos)) {
        ++pos;
        continue;
      }
      data.copy(lookbehind, 0, pos, len);
      self2._lookbehindSize = len - pos;
      break;
    }
    if (pos > 0)
      self2._cb(false, data, self2._bufPos, pos < len ? pos : len, true);
    self2._bufPos = len;
    return len;
  }
  function matchNeedle(self2, data, pos, len) {
    const lb = self2._lookbehind;
    const lbSize = self2._lookbehindSize;
    const needle = self2._needle;
    for (let i = 0; i < len; ++i, ++pos) {
      const ch = pos < 0 ? lb[lbSize + pos] : data[pos];
      if (ch !== needle[i])
        return false;
    }
    return true;
  }
  sbmh = SBMH;
  return sbmh;
}
var multipart;
var hasRequiredMultipart;
function requireMultipart() {
  if (hasRequiredMultipart) return multipart;
  hasRequiredMultipart = 1;
  const { Readable, Writable } = require$$0;
  const StreamSearch = requireSbmh();
  const {
    basename,
    convertToUTF8,
    getDecoder,
    parseContentType,
    parseDisposition
  } = requireUtils();
  const BUF_CRLF = Buffer.from("\r\n");
  const BUF_CR = Buffer.from("\r");
  const BUF_DASH = Buffer.from("-");
  function noop() {
  }
  const MAX_HEADER_PAIRS = 2e3;
  const MAX_HEADER_SIZE = 16 * 1024;
  const HPARSER_NAME = 0;
  const HPARSER_PRE_OWS = 1;
  const HPARSER_VALUE = 2;
  class HeaderParser {
    constructor(cb) {
      this.header = /* @__PURE__ */ Object.create(null);
      this.pairCount = 0;
      this.byteCount = 0;
      this.state = HPARSER_NAME;
      this.name = "";
      this.value = "";
      this.crlf = 0;
      this.cb = cb;
    }
    reset() {
      this.header = /* @__PURE__ */ Object.create(null);
      this.pairCount = 0;
      this.byteCount = 0;
      this.state = HPARSER_NAME;
      this.name = "";
      this.value = "";
      this.crlf = 0;
    }
    push(chunk, pos, end) {
      let start = pos;
      while (pos < end) {
        switch (this.state) {
          case HPARSER_NAME: {
            let done = false;
            for (; pos < end; ++pos) {
              if (this.byteCount === MAX_HEADER_SIZE)
                return -1;
              ++this.byteCount;
              const code = chunk[pos];
              if (TOKEN[code] !== 1) {
                if (code !== 58)
                  return -1;
                this.name += chunk.latin1Slice(start, pos);
                if (this.name.length === 0)
                  return -1;
                ++pos;
                done = true;
                this.state = HPARSER_PRE_OWS;
                break;
              }
            }
            if (!done) {
              this.name += chunk.latin1Slice(start, pos);
              break;
            }
          }
          case HPARSER_PRE_OWS: {
            let done = false;
            for (; pos < end; ++pos) {
              if (this.byteCount === MAX_HEADER_SIZE)
                return -1;
              ++this.byteCount;
              const code = chunk[pos];
              if (code !== 32 && code !== 9) {
                start = pos;
                done = true;
                this.state = HPARSER_VALUE;
                break;
              }
            }
            if (!done)
              break;
          }
          case HPARSER_VALUE:
            switch (this.crlf) {
              case 0:
                for (; pos < end; ++pos) {
                  if (this.byteCount === MAX_HEADER_SIZE)
                    return -1;
                  ++this.byteCount;
                  const code = chunk[pos];
                  if (FIELD_VCHAR[code] !== 1) {
                    if (code !== 13)
                      return -1;
                    ++this.crlf;
                    break;
                  }
                }
                this.value += chunk.latin1Slice(start, pos++);
                break;
              case 1:
                if (this.byteCount === MAX_HEADER_SIZE)
                  return -1;
                ++this.byteCount;
                if (chunk[pos++] !== 10)
                  return -1;
                ++this.crlf;
                break;
              case 2: {
                if (this.byteCount === MAX_HEADER_SIZE)
                  return -1;
                ++this.byteCount;
                const code = chunk[pos];
                if (code === 32 || code === 9) {
                  start = pos;
                  this.crlf = 0;
                } else {
                  if (++this.pairCount < MAX_HEADER_PAIRS) {
                    this.name = this.name.toLowerCase();
                    if (this.header[this.name] === void 0)
                      this.header[this.name] = [this.value];
                    else
                      this.header[this.name].push(this.value);
                  }
                  if (code === 13) {
                    ++this.crlf;
                    ++pos;
                  } else {
                    start = pos;
                    this.crlf = 0;
                    this.state = HPARSER_NAME;
                    this.name = "";
                    this.value = "";
                  }
                }
                break;
              }
              case 3: {
                if (this.byteCount === MAX_HEADER_SIZE)
                  return -1;
                ++this.byteCount;
                if (chunk[pos++] !== 10)
                  return -1;
                const header = this.header;
                this.reset();
                this.cb(header);
                return pos;
              }
            }
            break;
        }
      }
      return pos;
    }
  }
  class FileStream extends Readable {
    constructor(opts, owner) {
      super(opts);
      this.truncated = false;
      this._readcb = null;
      this.once("end", () => {
        this._read();
        if (--owner._fileEndsLeft === 0 && owner._finalcb) {
          const cb = owner._finalcb;
          owner._finalcb = null;
          process.nextTick(cb);
        }
      });
    }
    _read(n) {
      const cb = this._readcb;
      if (cb) {
        this._readcb = null;
        cb();
      }
    }
  }
  const ignoreData = {
    push: (chunk, pos) => {
    },
    destroy: () => {
    }
  };
  function callAndUnsetCb(self2, err) {
    const cb = self2._writecb;
    self2._writecb = null;
    if (cb)
      cb();
  }
  function nullDecoder(val, hint) {
    return val;
  }
  class Multipart extends Writable {
    constructor(cfg) {
      const streamOpts = {
        autoDestroy: true,
        emitClose: true,
        highWaterMark: typeof cfg.highWaterMark === "number" ? cfg.highWaterMark : void 0
      };
      super(streamOpts);
      if (!cfg.conType.params || typeof cfg.conType.params.boundary !== "string")
        throw new Error("Multipart: Boundary not found");
      const boundary = cfg.conType.params.boundary;
      const paramDecoder = typeof cfg.defParamCharset === "string" && cfg.defParamCharset ? getDecoder(cfg.defParamCharset) : nullDecoder;
      const defCharset = cfg.defCharset || "utf8";
      const preservePath = cfg.preservePath;
      const fileOpts = {
        autoDestroy: true,
        emitClose: true,
        highWaterMark: typeof cfg.fileHwm === "number" ? cfg.fileHwm : void 0
      };
      const limits = cfg.limits;
      const fieldSizeLimit = limits && typeof limits.fieldSize === "number" ? limits.fieldSize : 1 * 1024 * 1024;
      const fileSizeLimit = limits && typeof limits.fileSize === "number" ? limits.fileSize : Infinity;
      const filesLimit = limits && typeof limits.files === "number" ? limits.files : Infinity;
      const fieldsLimit = limits && typeof limits.fields === "number" ? limits.fields : Infinity;
      const partsLimit = limits && typeof limits.parts === "number" ? limits.parts : Infinity;
      let parts = -1;
      let fields = 0;
      let files = 0;
      let skipPart = false;
      this._fileEndsLeft = 0;
      this._fileStream = void 0;
      this._complete = false;
      let fileSize = 0;
      let field;
      let fieldSize = 0;
      let partCharset;
      let partEncoding;
      let partType;
      let partName;
      let partTruncated = false;
      let hitFilesLimit = false;
      let hitFieldsLimit = false;
      this._hparser = null;
      const hparser = new HeaderParser((header) => {
        this._hparser = null;
        skipPart = false;
        partType = "text/plain";
        partCharset = defCharset;
        partEncoding = "7bit";
        partName = void 0;
        partTruncated = false;
        let filename;
        if (!header["content-disposition"]) {
          skipPart = true;
          return;
        }
        const disp = parseDisposition(
          header["content-disposition"][0],
          paramDecoder
        );
        if (!disp || disp.type !== "form-data") {
          skipPart = true;
          return;
        }
        if (disp.params) {
          if (disp.params.name)
            partName = disp.params.name;
          if (disp.params["filename*"])
            filename = disp.params["filename*"];
          else if (disp.params.filename)
            filename = disp.params.filename;
          if (filename !== void 0 && !preservePath)
            filename = basename(filename);
        }
        if (header["content-type"]) {
          const conType = parseContentType(header["content-type"][0]);
          if (conType) {
            partType = `${conType.type}/${conType.subtype}`;
            if (conType.params && typeof conType.params.charset === "string")
              partCharset = conType.params.charset.toLowerCase();
          }
        }
        if (header["content-transfer-encoding"])
          partEncoding = header["content-transfer-encoding"][0].toLowerCase();
        if (partType === "application/octet-stream" || filename !== void 0) {
          if (files === filesLimit) {
            if (!hitFilesLimit) {
              hitFilesLimit = true;
              this.emit("filesLimit");
            }
            skipPart = true;
            return;
          }
          ++files;
          if (this.listenerCount("file") === 0) {
            skipPart = true;
            return;
          }
          fileSize = 0;
          this._fileStream = new FileStream(fileOpts, this);
          ++this._fileEndsLeft;
          this.emit(
            "file",
            partName,
            this._fileStream,
            {
              filename,
              encoding: partEncoding,
              mimeType: partType
            }
          );
        } else {
          if (fields === fieldsLimit) {
            if (!hitFieldsLimit) {
              hitFieldsLimit = true;
              this.emit("fieldsLimit");
            }
            skipPart = true;
            return;
          }
          ++fields;
          if (this.listenerCount("field") === 0) {
            skipPart = true;
            return;
          }
          field = [];
          fieldSize = 0;
        }
      });
      let matchPostBoundary = 0;
      const ssCb = (isMatch, data, start, end, isDataSafe) => {
        retrydata:
          while (data) {
            if (this._hparser !== null) {
              const ret = this._hparser.push(data, start, end);
              if (ret === -1) {
                this._hparser = null;
                hparser.reset();
                this.emit("error", new Error("Malformed part header"));
                break;
              }
              start = ret;
            }
            if (start === end)
              break;
            if (matchPostBoundary !== 0) {
              if (matchPostBoundary === 1) {
                switch (data[start]) {
                  case 45:
                    matchPostBoundary = 2;
                    ++start;
                    break;
                  case 13:
                    matchPostBoundary = 3;
                    ++start;
                    break;
                  default:
                    matchPostBoundary = 0;
                }
                if (start === end)
                  return;
              }
              if (matchPostBoundary === 2) {
                matchPostBoundary = 0;
                if (data[start] === 45) {
                  this._complete = true;
                  this._bparser = ignoreData;
                  return;
                }
                const writecb = this._writecb;
                this._writecb = noop;
                ssCb(false, BUF_DASH, 0, 1, false);
                this._writecb = writecb;
              } else if (matchPostBoundary === 3) {
                matchPostBoundary = 0;
                if (data[start] === 10) {
                  ++start;
                  if (parts >= partsLimit)
                    break;
                  this._hparser = hparser;
                  if (start === end)
                    break;
                  continue retrydata;
                } else {
                  const writecb = this._writecb;
                  this._writecb = noop;
                  ssCb(false, BUF_CR, 0, 1, false);
                  this._writecb = writecb;
                }
              }
            }
            if (!skipPart) {
              if (this._fileStream) {
                let chunk;
                const actualLen = Math.min(end - start, fileSizeLimit - fileSize);
                if (!isDataSafe) {
                  chunk = Buffer.allocUnsafe(actualLen);
                  data.copy(chunk, 0, start, start + actualLen);
                } else {
                  chunk = data.slice(start, start + actualLen);
                }
                fileSize += chunk.length;
                if (fileSize === fileSizeLimit) {
                  if (chunk.length > 0)
                    this._fileStream.push(chunk);
                  this._fileStream.emit("limit");
                  this._fileStream.truncated = true;
                  skipPart = true;
                } else if (!this._fileStream.push(chunk)) {
                  if (this._writecb)
                    this._fileStream._readcb = this._writecb;
                  this._writecb = null;
                }
              } else if (field !== void 0) {
                let chunk;
                const actualLen = Math.min(
                  end - start,
                  fieldSizeLimit - fieldSize
                );
                if (!isDataSafe) {
                  chunk = Buffer.allocUnsafe(actualLen);
                  data.copy(chunk, 0, start, start + actualLen);
                } else {
                  chunk = data.slice(start, start + actualLen);
                }
                fieldSize += actualLen;
                field.push(chunk);
                if (fieldSize === fieldSizeLimit) {
                  skipPart = true;
                  partTruncated = true;
                }
              }
            }
            break;
          }
        if (isMatch) {
          matchPostBoundary = 1;
          if (this._fileStream) {
            this._fileStream.push(null);
            this._fileStream = null;
          } else if (field !== void 0) {
            let data2;
            switch (field.length) {
              case 0:
                data2 = "";
                break;
              case 1:
                data2 = convertToUTF8(field[0], partCharset, 0);
                break;
              default:
                data2 = convertToUTF8(
                  Buffer.concat(field, fieldSize),
                  partCharset,
                  0
                );
            }
            field = void 0;
            fieldSize = 0;
            this.emit(
              "field",
              partName,
              data2,
              {
                nameTruncated: false,
                valueTruncated: partTruncated,
                encoding: partEncoding,
                mimeType: partType
              }
            );
          }
          if (++parts === partsLimit)
            this.emit("partsLimit");
        }
      };
      this._bparser = new StreamSearch(`\r
--${boundary}`, ssCb);
      this._writecb = null;
      this._finalcb = null;
      this.write(BUF_CRLF);
    }
    static detect(conType) {
      return conType.type === "multipart" && conType.subtype === "form-data";
    }
    _write(chunk, enc, cb) {
      this._writecb = cb;
      this._bparser.push(chunk, 0);
      if (this._writecb)
        callAndUnsetCb(this);
    }
    _destroy(err, cb) {
      this._hparser = null;
      this._bparser = ignoreData;
      if (!err)
        err = checkEndState(this);
      const fileStream = this._fileStream;
      if (fileStream) {
        this._fileStream = null;
        fileStream.destroy(err);
      }
      cb(err);
    }
    _final(cb) {
      this._bparser.destroy();
      if (!this._complete)
        return cb(new Error("Unexpected end of form"));
      if (this._fileEndsLeft)
        this._finalcb = finalcb.bind(null, this, cb);
      else
        finalcb(this, cb);
    }
  }
  function finalcb(self2, cb, err) {
    if (err)
      return cb(err);
    err = checkEndState(self2);
    cb(err);
  }
  function checkEndState(self2) {
    if (self2._hparser)
      return new Error("Malformed part header");
    const fileStream = self2._fileStream;
    if (fileStream) {
      self2._fileStream = null;
      fileStream.destroy(new Error("Unexpected end of file"));
    }
    if (!self2._complete)
      return new Error("Unexpected end of form");
  }
  const TOKEN = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ];
  const FIELD_VCHAR = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1
  ];
  multipart = Multipart;
  return multipart;
}
var urlencoded;
var hasRequiredUrlencoded;
function requireUrlencoded() {
  if (hasRequiredUrlencoded) return urlencoded;
  hasRequiredUrlencoded = 1;
  const { Writable } = require$$0;
  const { getDecoder } = requireUtils();
  class URLEncoded extends Writable {
    constructor(cfg) {
      const streamOpts = {
        autoDestroy: true,
        emitClose: true,
        highWaterMark: typeof cfg.highWaterMark === "number" ? cfg.highWaterMark : void 0
      };
      super(streamOpts);
      let charset = cfg.defCharset || "utf8";
      if (cfg.conType.params && typeof cfg.conType.params.charset === "string")
        charset = cfg.conType.params.charset;
      this.charset = charset;
      const limits = cfg.limits;
      this.fieldSizeLimit = limits && typeof limits.fieldSize === "number" ? limits.fieldSize : 1 * 1024 * 1024;
      this.fieldsLimit = limits && typeof limits.fields === "number" ? limits.fields : Infinity;
      this.fieldNameSizeLimit = limits && typeof limits.fieldNameSize === "number" ? limits.fieldNameSize : 100;
      this._inKey = true;
      this._keyTrunc = false;
      this._valTrunc = false;
      this._bytesKey = 0;
      this._bytesVal = 0;
      this._fields = 0;
      this._key = "";
      this._val = "";
      this._byte = -2;
      this._lastPos = 0;
      this._encode = 0;
      this._decoder = getDecoder(charset);
    }
    static detect(conType) {
      return conType.type === "application" && conType.subtype === "x-www-form-urlencoded";
    }
    _write(chunk, enc, cb) {
      if (this._fields >= this.fieldsLimit)
        return cb();
      let i = 0;
      const len = chunk.length;
      this._lastPos = 0;
      if (this._byte !== -2) {
        i = readPctEnc(this, chunk, i, len);
        if (i === -1)
          return cb(new Error("Malformed urlencoded form"));
        if (i >= len)
          return cb();
        if (this._inKey)
          ++this._bytesKey;
        else
          ++this._bytesVal;
      }
      main:
        while (i < len) {
          if (this._inKey) {
            i = skipKeyBytes(this, chunk, i, len);
            while (i < len) {
              switch (chunk[i]) {
                case 61:
                  if (this._lastPos < i)
                    this._key += chunk.latin1Slice(this._lastPos, i);
                  this._lastPos = ++i;
                  this._key = this._decoder(this._key, this._encode);
                  this._encode = 0;
                  this._inKey = false;
                  continue main;
                case 38:
                  if (this._lastPos < i)
                    this._key += chunk.latin1Slice(this._lastPos, i);
                  this._lastPos = ++i;
                  this._key = this._decoder(this._key, this._encode);
                  this._encode = 0;
                  if (this._bytesKey > 0) {
                    this.emit(
                      "field",
                      this._key,
                      "",
                      {
                        nameTruncated: this._keyTrunc,
                        valueTruncated: false,
                        encoding: this.charset,
                        mimeType: "text/plain"
                      }
                    );
                  }
                  this._key = "";
                  this._val = "";
                  this._keyTrunc = false;
                  this._valTrunc = false;
                  this._bytesKey = 0;
                  this._bytesVal = 0;
                  if (++this._fields >= this.fieldsLimit) {
                    this.emit("fieldsLimit");
                    return cb();
                  }
                  continue;
                case 43:
                  if (this._lastPos < i)
                    this._key += chunk.latin1Slice(this._lastPos, i);
                  this._key += " ";
                  this._lastPos = i + 1;
                  break;
                case 37:
                  if (this._encode === 0)
                    this._encode = 1;
                  if (this._lastPos < i)
                    this._key += chunk.latin1Slice(this._lastPos, i);
                  this._lastPos = i + 1;
                  this._byte = -1;
                  i = readPctEnc(this, chunk, i + 1, len);
                  if (i === -1)
                    return cb(new Error("Malformed urlencoded form"));
                  if (i >= len)
                    return cb();
                  ++this._bytesKey;
                  i = skipKeyBytes(this, chunk, i, len);
                  continue;
              }
              ++i;
              ++this._bytesKey;
              i = skipKeyBytes(this, chunk, i, len);
            }
            if (this._lastPos < i)
              this._key += chunk.latin1Slice(this._lastPos, i);
          } else {
            i = skipValBytes(this, chunk, i, len);
            while (i < len) {
              switch (chunk[i]) {
                case 38:
                  if (this._lastPos < i)
                    this._val += chunk.latin1Slice(this._lastPos, i);
                  this._lastPos = ++i;
                  this._inKey = true;
                  this._val = this._decoder(this._val, this._encode);
                  this._encode = 0;
                  if (this._bytesKey > 0 || this._bytesVal > 0) {
                    this.emit(
                      "field",
                      this._key,
                      this._val,
                      {
                        nameTruncated: this._keyTrunc,
                        valueTruncated: this._valTrunc,
                        encoding: this.charset,
                        mimeType: "text/plain"
                      }
                    );
                  }
                  this._key = "";
                  this._val = "";
                  this._keyTrunc = false;
                  this._valTrunc = false;
                  this._bytesKey = 0;
                  this._bytesVal = 0;
                  if (++this._fields >= this.fieldsLimit) {
                    this.emit("fieldsLimit");
                    return cb();
                  }
                  continue main;
                case 43:
                  if (this._lastPos < i)
                    this._val += chunk.latin1Slice(this._lastPos, i);
                  this._val += " ";
                  this._lastPos = i + 1;
                  break;
                case 37:
                  if (this._encode === 0)
                    this._encode = 1;
                  if (this._lastPos < i)
                    this._val += chunk.latin1Slice(this._lastPos, i);
                  this._lastPos = i + 1;
                  this._byte = -1;
                  i = readPctEnc(this, chunk, i + 1, len);
                  if (i === -1)
                    return cb(new Error("Malformed urlencoded form"));
                  if (i >= len)
                    return cb();
                  ++this._bytesVal;
                  i = skipValBytes(this, chunk, i, len);
                  continue;
              }
              ++i;
              ++this._bytesVal;
              i = skipValBytes(this, chunk, i, len);
            }
            if (this._lastPos < i)
              this._val += chunk.latin1Slice(this._lastPos, i);
          }
        }
      cb();
    }
    _final(cb) {
      if (this._byte !== -2)
        return cb(new Error("Malformed urlencoded form"));
      if (!this._inKey || this._bytesKey > 0 || this._bytesVal > 0) {
        if (this._inKey)
          this._key = this._decoder(this._key, this._encode);
        else
          this._val = this._decoder(this._val, this._encode);
        this.emit(
          "field",
          this._key,
          this._val,
          {
            nameTruncated: this._keyTrunc,
            valueTruncated: this._valTrunc,
            encoding: this.charset,
            mimeType: "text/plain"
          }
        );
      }
      cb();
    }
  }
  function readPctEnc(self2, chunk, pos, len) {
    if (pos >= len)
      return len;
    if (self2._byte === -1) {
      const hexUpper = HEX_VALUES[chunk[pos++]];
      if (hexUpper === -1)
        return -1;
      if (hexUpper >= 8)
        self2._encode = 2;
      if (pos < len) {
        const hexLower = HEX_VALUES[chunk[pos++]];
        if (hexLower === -1)
          return -1;
        if (self2._inKey)
          self2._key += String.fromCharCode((hexUpper << 4) + hexLower);
        else
          self2._val += String.fromCharCode((hexUpper << 4) + hexLower);
        self2._byte = -2;
        self2._lastPos = pos;
      } else {
        self2._byte = hexUpper;
      }
    } else {
      const hexLower = HEX_VALUES[chunk[pos++]];
      if (hexLower === -1)
        return -1;
      if (self2._inKey)
        self2._key += String.fromCharCode((self2._byte << 4) + hexLower);
      else
        self2._val += String.fromCharCode((self2._byte << 4) + hexLower);
      self2._byte = -2;
      self2._lastPos = pos;
    }
    return pos;
  }
  function skipKeyBytes(self2, chunk, pos, len) {
    if (self2._bytesKey > self2.fieldNameSizeLimit) {
      if (!self2._keyTrunc) {
        if (self2._lastPos < pos)
          self2._key += chunk.latin1Slice(self2._lastPos, pos - 1);
      }
      self2._keyTrunc = true;
      for (; pos < len; ++pos) {
        const code = chunk[pos];
        if (code === 61 || code === 38)
          break;
        ++self2._bytesKey;
      }
      self2._lastPos = pos;
    }
    return pos;
  }
  function skipValBytes(self2, chunk, pos, len) {
    if (self2._bytesVal > self2.fieldSizeLimit) {
      if (!self2._valTrunc) {
        if (self2._lastPos < pos)
          self2._val += chunk.latin1Slice(self2._lastPos, pos - 1);
      }
      self2._valTrunc = true;
      for (; pos < len; ++pos) {
        if (chunk[pos] === 38)
          break;
        ++self2._bytesVal;
      }
      self2._lastPos = pos;
    }
    return pos;
  }
  const HEX_VALUES = [
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    10,
    11,
    12,
    13,
    14,
    15,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    10,
    11,
    12,
    13,
    14,
    15,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1
  ];
  urlencoded = URLEncoded;
  return urlencoded;
}
var lib;
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib) return lib;
  hasRequiredLib = 1;
  const { parseContentType } = requireUtils();
  function getInstance(cfg) {
    const headers = cfg.headers;
    const conType = parseContentType(headers["content-type"]);
    if (!conType)
      throw new Error("Malformed content type");
    for (const type of TYPES) {
      const matched = type.detect(conType);
      if (!matched)
        continue;
      const instanceCfg = {
        limits: cfg.limits,
        headers,
        conType,
        highWaterMark: void 0,
        fileHwm: void 0,
        defCharset: void 0,
        defParamCharset: void 0,
        preservePath: false
      };
      if (cfg.highWaterMark)
        instanceCfg.highWaterMark = cfg.highWaterMark;
      if (cfg.fileHwm)
        instanceCfg.fileHwm = cfg.fileHwm;
      instanceCfg.defCharset = cfg.defCharset;
      instanceCfg.defParamCharset = cfg.defParamCharset;
      instanceCfg.preservePath = cfg.preservePath;
      return new type(instanceCfg);
    }
    throw new Error(`Unsupported content type: ${headers["content-type"]}`);
  }
  const TYPES = [
    requireMultipart(),
    requireUrlencoded()
  ].filter(function(typemod) {
    return typeof typemod.detect === "function";
  });
  lib = (cfg) => {
    if (typeof cfg !== "object" || cfg === null)
      cfg = {};
    if (typeof cfg.headers !== "object" || cfg.headers === null || typeof cfg.headers["content-type"] !== "string") {
      throw new Error("Missing Content-Type");
    }
    return getInstance(cfg);
  };
  return lib;
}
var immutable;
var hasRequiredImmutable;
function requireImmutable() {
  if (hasRequiredImmutable) return immutable;
  hasRequiredImmutable = 1;
  immutable = extend;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function extend() {
    var target = {};
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  }
  return immutable;
}
var parsePath_1;
var hasRequiredParsePath;
function requireParsePath() {
  if (hasRequiredParsePath) return parsePath_1;
  hasRequiredParsePath = 1;
  var reFirstKey = /^[^\[]*/;
  var reDigitPath = /^\[(\d+)\]/;
  var reNormalPath = /^\[([^\]]+)\]/;
  function parsePath(key) {
    function failure() {
      return [{ type: "object", key, last: true }];
    }
    var firstKey = reFirstKey.exec(key)[0];
    if (!firstKey) return failure();
    var len = key.length;
    var pos = firstKey.length;
    var tail = { type: "object", key: firstKey };
    var steps = [tail];
    while (pos < len) {
      var m;
      if (key[pos] === "[" && key[pos + 1] === "]") {
        pos += 2;
        tail.append = true;
        if (pos !== len) return failure();
        continue;
      }
      m = reDigitPath.exec(key.substring(pos));
      if (m !== null) {
        pos += m[0].length;
        tail.nextType = "array";
        tail = { type: "array", key: parseInt(m[1], 10) };
        steps.push(tail);
        continue;
      }
      m = reNormalPath.exec(key.substring(pos));
      if (m !== null) {
        pos += m[0].length;
        tail.nextType = "object";
        tail = { type: "object", key: m[1] };
        steps.push(tail);
        continue;
      }
      return failure();
    }
    tail.last = true;
    return steps;
  }
  parsePath_1 = parsePath;
  return parsePath_1;
}
var setValue_1;
var hasRequiredSetValue;
function requireSetValue() {
  if (hasRequiredSetValue) return setValue_1;
  hasRequiredSetValue = 1;
  function valueType(value) {
    if (value === void 0) return "undefined";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return "scalar";
  }
  function setLastValue(context, step, currentValue, entryValue) {
    switch (valueType(currentValue)) {
      case "undefined":
        if (step.append) {
          context[step.key] = [entryValue];
        } else {
          context[step.key] = entryValue;
        }
        break;
      case "array":
        context[step.key].push(entryValue);
        break;
      case "object":
        return setLastValue(currentValue, { key: "" }, currentValue[""], entryValue);
      case "scalar":
        context[step.key] = [context[step.key], entryValue];
        break;
    }
    return context;
  }
  function setValue(context, step, currentValue, entryValue) {
    if (step.last) return setLastValue(context, step, currentValue, entryValue);
    var obj;
    switch (valueType(currentValue)) {
      case "undefined":
        if (step.nextType === "array") {
          context[step.key] = [];
        } else {
          context[step.key] = /* @__PURE__ */ Object.create(null);
        }
        return context[step.key];
      case "object":
        return context[step.key];
      case "array":
        if (step.nextType === "array") {
          return currentValue;
        }
        obj = /* @__PURE__ */ Object.create(null);
        context[step.key] = obj;
        currentValue.forEach(function(item, i) {
          if (item !== void 0) obj["" + i] = item;
        });
        return obj;
      case "scalar":
        obj = /* @__PURE__ */ Object.create(null);
        obj[""] = currentValue;
        context[step.key] = obj;
        return obj;
    }
  }
  setValue_1 = setValue;
  return setValue_1;
}
var appendField_1;
var hasRequiredAppendField;
function requireAppendField() {
  if (hasRequiredAppendField) return appendField_1;
  hasRequiredAppendField = 1;
  var parsePath = requireParsePath();
  var setValue = requireSetValue();
  function appendField(store, key, value) {
    var steps = parsePath(key);
    steps.reduce(function(context, step) {
      return setValue(context, step, context[step.key], value);
    }, store);
  }
  appendField_1 = appendField;
  return appendField_1;
}
var counter;
var hasRequiredCounter;
function requireCounter() {
  if (hasRequiredCounter) return counter;
  hasRequiredCounter = 1;
  var EventEmitter = require$$0$1.EventEmitter;
  function Counter() {
    EventEmitter.call(this);
    this.value = 0;
  }
  Counter.prototype = Object.create(EventEmitter.prototype);
  Counter.prototype.increment = function increment() {
    this.value++;
  };
  Counter.prototype.decrement = function decrement() {
    if (--this.value === 0) this.emit("zero");
  };
  Counter.prototype.isZero = function isZero() {
    return this.value === 0;
  };
  Counter.prototype.onceZero = function onceZero(fn) {
    if (this.isZero()) return fn();
    this.once("zero", fn);
  };
  counter = Counter;
  return counter;
}
var multerError;
var hasRequiredMulterError;
function requireMulterError() {
  if (hasRequiredMulterError) return multerError;
  hasRequiredMulterError = 1;
  var util2 = require$$0$2;
  var errorMessages = {
    LIMIT_PART_COUNT: "Too many parts",
    LIMIT_FILE_SIZE: "File too large",
    LIMIT_FILE_COUNT: "Too many files",
    LIMIT_FIELD_KEY: "Field name too long",
    LIMIT_FIELD_VALUE: "Field value too long",
    LIMIT_FIELD_COUNT: "Too many fields",
    LIMIT_UNEXPECTED_FILE: "Unexpected field",
    MISSING_FIELD_NAME: "Field name missing"
  };
  function MulterError(code, field) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = errorMessages[code];
    this.code = code;
    if (field) this.field = field;
  }
  util2.inherits(MulterError, Error);
  multerError = MulterError;
  return multerError;
}
var fileAppender;
var hasRequiredFileAppender;
function requireFileAppender() {
  if (hasRequiredFileAppender) return fileAppender;
  hasRequiredFileAppender = 1;
  var objectAssign = require$$0$3;
  function arrayRemove(arr, item) {
    var idx = arr.indexOf(item);
    if (~idx) arr.splice(idx, 1);
  }
  function FileAppender(strategy, req) {
    this.strategy = strategy;
    this.req = req;
    switch (strategy) {
      case "NONE":
        break;
      case "VALUE":
        break;
      case "ARRAY":
        req.files = [];
        break;
      case "OBJECT":
        req.files = /* @__PURE__ */ Object.create(null);
        break;
      default:
        throw new Error("Unknown file strategy: " + strategy);
    }
  }
  FileAppender.prototype.insertPlaceholder = function(file) {
    var placeholder = {
      fieldname: file.fieldname
    };
    switch (this.strategy) {
      case "NONE":
        break;
      case "VALUE":
        break;
      case "ARRAY":
        this.req.files.push(placeholder);
        break;
      case "OBJECT":
        if (this.req.files[file.fieldname]) {
          this.req.files[file.fieldname].push(placeholder);
        } else {
          this.req.files[file.fieldname] = [placeholder];
        }
        break;
    }
    return placeholder;
  };
  FileAppender.prototype.removePlaceholder = function(placeholder) {
    switch (this.strategy) {
      case "NONE":
        break;
      case "VALUE":
        break;
      case "ARRAY":
        arrayRemove(this.req.files, placeholder);
        break;
      case "OBJECT":
        if (this.req.files[placeholder.fieldname].length === 1) {
          delete this.req.files[placeholder.fieldname];
        } else {
          arrayRemove(this.req.files[placeholder.fieldname], placeholder);
        }
        break;
    }
  };
  FileAppender.prototype.replacePlaceholder = function(placeholder, file) {
    if (this.strategy === "VALUE") {
      this.req.file = file;
      return;
    }
    delete placeholder.fieldname;
    objectAssign(placeholder, file);
  };
  fileAppender = FileAppender;
  return fileAppender;
}
var removeUploadedFiles_1;
var hasRequiredRemoveUploadedFiles;
function requireRemoveUploadedFiles() {
  if (hasRequiredRemoveUploadedFiles) return removeUploadedFiles_1;
  hasRequiredRemoveUploadedFiles = 1;
  function removeUploadedFiles(uploadedFiles, remove, cb) {
    var length = uploadedFiles.length;
    var errors = [];
    if (length === 0) return cb(null, errors);
    function handleFile(idx) {
      var file = uploadedFiles[idx];
      remove(file, function(err) {
        if (err) {
          err.file = file;
          err.field = file.fieldname;
          errors.push(err);
        }
        if (idx < length - 1) {
          handleFile(idx + 1);
        } else {
          cb(null, errors);
        }
      });
    }
    handleFile(0);
  }
  removeUploadedFiles_1 = removeUploadedFiles;
  return removeUploadedFiles_1;
}
var makeMiddleware_1;
var hasRequiredMakeMiddleware;
function requireMakeMiddleware() {
  if (hasRequiredMakeMiddleware) return makeMiddleware_1;
  hasRequiredMakeMiddleware = 1;
  var is = require$$0$4;
  var Busboy = requireLib();
  var extend = requireImmutable();
  var appendField = requireAppendField();
  var Counter = requireCounter();
  var MulterError = requireMulterError();
  var FileAppender = requireFileAppender();
  var removeUploadedFiles = requireRemoveUploadedFiles();
  function makeMiddleware(setup) {
    return function multerMiddleware(req, res, next) {
      if (!is(req, ["multipart"])) return next();
      var options = setup();
      var limits = options.limits;
      var storage2 = options.storage;
      var fileFilter = options.fileFilter;
      var fileStrategy = options.fileStrategy;
      var preservePath = options.preservePath;
      req.body = /* @__PURE__ */ Object.create(null);
      var busboy;
      try {
        busboy = Busboy({ headers: req.headers, limits, preservePath });
      } catch (err) {
        return next(err);
      }
      var appender = new FileAppender(fileStrategy, req);
      var isDone = false;
      var readFinished = false;
      var errorOccured = false;
      var pendingWrites = new Counter();
      var uploadedFiles = [];
      function done(err) {
        if (isDone) return;
        isDone = true;
        req.unpipe(busboy);
        process.nextTick(() => {
          busboy.removeAllListeners();
        });
        next(err);
      }
      function indicateDone() {
        if (readFinished && pendingWrites.isZero() && !errorOccured) done();
      }
      function abortWithError(uploadError) {
        if (errorOccured) return;
        errorOccured = true;
        pendingWrites.onceZero(function() {
          function remove(file, cb) {
            storage2._removeFile(req, file, cb);
          }
          removeUploadedFiles(uploadedFiles, remove, function(err, storageErrors) {
            if (err) return done(err);
            uploadError.storageErrors = storageErrors;
            done(uploadError);
          });
        });
      }
      function abortWithCode(code, optionalField) {
        abortWithError(new MulterError(code, optionalField));
      }
      busboy.on("field", function(fieldname, value, { nameTruncated, valueTruncated }) {
        if (fieldname == null) return abortWithCode("MISSING_FIELD_NAME");
        if (nameTruncated) return abortWithCode("LIMIT_FIELD_KEY");
        if (valueTruncated) return abortWithCode("LIMIT_FIELD_VALUE", fieldname);
        if (limits && Object.prototype.hasOwnProperty.call(limits, "fieldNameSize")) {
          if (fieldname.length > limits.fieldNameSize) return abortWithCode("LIMIT_FIELD_KEY");
        }
        appendField(req.body, fieldname, value);
      });
      busboy.on("file", function(fieldname, fileStream, { filename, encoding, mimeType }) {
        if (!filename) return fileStream.resume();
        if (limits && Object.prototype.hasOwnProperty.call(limits, "fieldNameSize")) {
          if (fieldname.length > limits.fieldNameSize) return abortWithCode("LIMIT_FIELD_KEY");
        }
        var file = {
          fieldname,
          originalname: filename,
          encoding,
          mimetype: mimeType
        };
        var placeholder = appender.insertPlaceholder(file);
        fileFilter(req, file, function(err, includeFile) {
          if (err) {
            appender.removePlaceholder(placeholder);
            return abortWithError(err);
          }
          if (!includeFile) {
            appender.removePlaceholder(placeholder);
            return fileStream.resume();
          }
          var aborting = false;
          pendingWrites.increment();
          Object.defineProperty(file, "stream", {
            configurable: true,
            enumerable: false,
            value: fileStream
          });
          fileStream.on("error", function(err2) {
            pendingWrites.decrement();
            abortWithError(err2);
          });
          fileStream.on("limit", function() {
            aborting = true;
            abortWithCode("LIMIT_FILE_SIZE", fieldname);
          });
          storage2._handleFile(req, file, function(err2, info) {
            if (aborting) {
              appender.removePlaceholder(placeholder);
              uploadedFiles.push(extend(file, info));
              return pendingWrites.decrement();
            }
            if (err2) {
              appender.removePlaceholder(placeholder);
              pendingWrites.decrement();
              return abortWithError(err2);
            }
            var fileInfo = extend(file, info);
            appender.replacePlaceholder(placeholder, fileInfo);
            uploadedFiles.push(fileInfo);
            pendingWrites.decrement();
            indicateDone();
          });
        });
      });
      busboy.on("error", function(err) {
        abortWithError(err);
      });
      busboy.on("partsLimit", function() {
        abortWithCode("LIMIT_PART_COUNT");
      });
      busboy.on("filesLimit", function() {
        abortWithCode("LIMIT_FILE_COUNT");
      });
      busboy.on("fieldsLimit", function() {
        abortWithCode("LIMIT_FIELD_COUNT");
      });
      busboy.on("close", function() {
        readFinished = true;
        indicateDone();
      });
      req.pipe(busboy);
    };
  }
  makeMiddleware_1 = makeMiddleware;
  return makeMiddleware_1;
}
var mkdirp;
var hasRequiredMkdirp;
function requireMkdirp() {
  if (hasRequiredMkdirp) return mkdirp;
  hasRequiredMkdirp = 1;
  var path2 = path__default;
  var fs2 = fs__default;
  var _0777 = parseInt("0777", 8);
  mkdirp = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
  function mkdirP(p, opts, f, made) {
    if (typeof opts === "function") {
      f = opts;
      opts = {};
    } else if (!opts || typeof opts !== "object") {
      opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs2;
    if (mode === void 0) {
      mode = _0777;
    }
    if (!made) made = null;
    var cb = f || /* istanbul ignore next */
    function() {
    };
    p = path2.resolve(p);
    xfs.mkdir(p, mode, function(er) {
      if (!er) {
        made = made || p;
        return cb(null, made);
      }
      switch (er.code) {
        case "ENOENT":
          if (path2.dirname(p) === p) return cb(er);
          mkdirP(path2.dirname(p), opts, function(er2, made2) {
            if (er2) cb(er2, made2);
            else mkdirP(p, opts, cb, made2);
          });
          break;
        // In the case of any other error, just see if there's a dir
        // there already.  If so, then hooray!  If not, then something
        // is borked.
        default:
          xfs.stat(p, function(er2, stat) {
            if (er2 || !stat.isDirectory()) cb(er, made);
            else cb(null, made);
          });
          break;
      }
    });
  }
  mkdirP.sync = function sync(p, opts, made) {
    if (!opts || typeof opts !== "object") {
      opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs2;
    if (mode === void 0) {
      mode = _0777;
    }
    if (!made) made = null;
    p = path2.resolve(p);
    try {
      xfs.mkdirSync(p, mode);
      made = made || p;
    } catch (err0) {
      switch (err0.code) {
        case "ENOENT":
          made = sync(path2.dirname(p), opts, made);
          sync(p, opts, made);
          break;
        // In the case of any other error, just see if there's a dir
        // there already.  If so, then hooray!  If not, then something
        // is borked.
        default:
          var stat;
          try {
            stat = xfs.statSync(p);
          } catch (err1) {
            throw err0;
          }
          if (!stat.isDirectory()) throw err0;
          break;
      }
    }
    return made;
  };
  return mkdirp;
}
var disk;
var hasRequiredDisk;
function requireDisk() {
  if (hasRequiredDisk) return disk;
  hasRequiredDisk = 1;
  var fs2 = fs__default;
  var os = require$$1;
  var path2 = path__default;
  var crypto = require$$3;
  var mkdirp2 = requireMkdirp();
  function getFilename(req, file, cb) {
    crypto.randomBytes(16, function(err, raw) {
      cb(err, err ? void 0 : raw.toString("hex"));
    });
  }
  function getDestination(req, file, cb) {
    cb(null, os.tmpdir());
  }
  function DiskStorage(opts) {
    this.getFilename = opts.filename || getFilename;
    if (typeof opts.destination === "string") {
      mkdirp2.sync(opts.destination);
      this.getDestination = function($0, $1, cb) {
        cb(null, opts.destination);
      };
    } else {
      this.getDestination = opts.destination || getDestination;
    }
  }
  DiskStorage.prototype._handleFile = function _handleFile(req, file, cb) {
    var that = this;
    that.getDestination(req, file, function(err, destination) {
      if (err) return cb(err);
      that.getFilename(req, file, function(err2, filename) {
        if (err2) return cb(err2);
        var finalPath = path2.join(destination, filename);
        var outStream = fs2.createWriteStream(finalPath);
        file.stream.pipe(outStream);
        outStream.on("error", cb);
        outStream.on("finish", function() {
          cb(null, {
            destination,
            filename,
            path: finalPath,
            size: outStream.bytesWritten
          });
        });
      });
    });
  };
  DiskStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    var path3 = file.path;
    delete file.destination;
    delete file.filename;
    delete file.path;
    fs2.unlink(path3, cb);
  };
  disk = function(opts) {
    return new DiskStorage(opts);
  };
  return disk;
}
var readable = { exports: {} };
var processNextickArgs = { exports: {} };
var hasRequiredProcessNextickArgs;
function requireProcessNextickArgs() {
  if (hasRequiredProcessNextickArgs) return processNextickArgs.exports;
  hasRequiredProcessNextickArgs = 1;
  if (typeof process === "undefined" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
    processNextickArgs.exports = { nextTick };
  } else {
    processNextickArgs.exports = process;
  }
  function nextTick(fn, arg1, arg2, arg3) {
    if (typeof fn !== "function") {
      throw new TypeError('"callback" argument must be a function');
    }
    var len = arguments.length;
    var args, i;
    switch (len) {
      case 0:
      case 1:
        return process.nextTick(fn);
      case 2:
        return process.nextTick(function afterTickOne() {
          fn.call(null, arg1);
        });
      case 3:
        return process.nextTick(function afterTickTwo() {
          fn.call(null, arg1, arg2);
        });
      case 4:
        return process.nextTick(function afterTickThree() {
          fn.call(null, arg1, arg2, arg3);
        });
      default:
        args = new Array(len - 1);
        i = 0;
        while (i < args.length) {
          args[i++] = arguments[i];
        }
        return process.nextTick(function afterTick() {
          fn.apply(null, args);
        });
    }
  }
  return processNextickArgs.exports;
}
var isarray;
var hasRequiredIsarray;
function requireIsarray() {
  if (hasRequiredIsarray) return isarray;
  hasRequiredIsarray = 1;
  var toString = {}.toString;
  isarray = Array.isArray || function(arr) {
    return toString.call(arr) == "[object Array]";
  };
  return isarray;
}
var stream;
var hasRequiredStream;
function requireStream() {
  if (hasRequiredStream) return stream;
  hasRequiredStream = 1;
  stream = require$$0;
  return stream;
}
var util = {};
var hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil) return util;
  hasRequiredUtil = 1;
  function isArray(arg) {
    if (Array.isArray) {
      return Array.isArray(arg);
    }
    return objectToString(arg) === "[object Array]";
  }
  util.isArray = isArray;
  function isBoolean(arg) {
    return typeof arg === "boolean";
  }
  util.isBoolean = isBoolean;
  function isNull(arg) {
    return arg === null;
  }
  util.isNull = isNull;
  function isNullOrUndefined(arg) {
    return arg == null;
  }
  util.isNullOrUndefined = isNullOrUndefined;
  function isNumber(arg) {
    return typeof arg === "number";
  }
  util.isNumber = isNumber;
  function isString(arg) {
    return typeof arg === "string";
  }
  util.isString = isString;
  function isSymbol(arg) {
    return typeof arg === "symbol";
  }
  util.isSymbol = isSymbol;
  function isUndefined(arg) {
    return arg === void 0;
  }
  util.isUndefined = isUndefined;
  function isRegExp(re) {
    return objectToString(re) === "[object RegExp]";
  }
  util.isRegExp = isRegExp;
  function isObject(arg) {
    return typeof arg === "object" && arg !== null;
  }
  util.isObject = isObject;
  function isDate(d) {
    return objectToString(d) === "[object Date]";
  }
  util.isDate = isDate;
  function isError(e) {
    return objectToString(e) === "[object Error]" || e instanceof Error;
  }
  util.isError = isError;
  function isFunction(arg) {
    return typeof arg === "function";
  }
  util.isFunction = isFunction;
  function isPrimitive(arg) {
    return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || // ES6 symbol
    typeof arg === "undefined";
  }
  util.isPrimitive = isPrimitive;
  util.isBuffer = require$$0$5.Buffer.isBuffer;
  function objectToString(o) {
    return Object.prototype.toString.call(o);
  }
  return util;
}
var BufferList = { exports: {} };
var hasRequiredBufferList;
function requireBufferList() {
  if (hasRequiredBufferList) return BufferList.exports;
  hasRequiredBufferList = 1;
  (function(module) {
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Buffer2 = require$$0$6.Buffer;
    var util2 = require$$0$2;
    function copyBuffer(src, target, offset) {
      src.copy(target, offset);
    }
    module.exports = function() {
      function BufferList2() {
        _classCallCheck(this, BufferList2);
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      BufferList2.prototype.push = function push(v) {
        var entry = { data: v, next: null };
        if (this.length > 0) this.tail.next = entry;
        else this.head = entry;
        this.tail = entry;
        ++this.length;
      };
      BufferList2.prototype.unshift = function unshift(v) {
        var entry = { data: v, next: this.head };
        if (this.length === 0) this.tail = entry;
        this.head = entry;
        ++this.length;
      };
      BufferList2.prototype.shift = function shift() {
        if (this.length === 0) return;
        var ret = this.head.data;
        if (this.length === 1) this.head = this.tail = null;
        else this.head = this.head.next;
        --this.length;
        return ret;
      };
      BufferList2.prototype.clear = function clear() {
        this.head = this.tail = null;
        this.length = 0;
      };
      BufferList2.prototype.join = function join(s) {
        if (this.length === 0) return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next) {
          ret += s + p.data;
        }
        return ret;
      };
      BufferList2.prototype.concat = function concat(n) {
        if (this.length === 0) return Buffer2.alloc(0);
        var ret = Buffer2.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      };
      return BufferList2;
    }();
    if (util2 && util2.inspect && util2.inspect.custom) {
      module.exports.prototype[util2.inspect.custom] = function() {
        var obj = util2.inspect({ length: this.length });
        return this.constructor.name + " " + obj;
      };
    }
  })(BufferList);
  return BufferList.exports;
}
var destroy_1;
var hasRequiredDestroy;
function requireDestroy() {
  if (hasRequiredDestroy) return destroy_1;
  hasRequiredDestroy = 1;
  var pna = requireProcessNextickArgs();
  function destroy(err, cb) {
    var _this = this;
    var readableDestroyed = this._readableState && this._readableState.destroyed;
    var writableDestroyed = this._writableState && this._writableState.destroyed;
    if (readableDestroyed || writableDestroyed) {
      if (cb) {
        cb(err);
      } else if (err) {
        if (!this._writableState) {
          pna.nextTick(emitErrorNT, this, err);
        } else if (!this._writableState.errorEmitted) {
          this._writableState.errorEmitted = true;
          pna.nextTick(emitErrorNT, this, err);
        }
      }
      return this;
    }
    if (this._readableState) {
      this._readableState.destroyed = true;
    }
    if (this._writableState) {
      this._writableState.destroyed = true;
    }
    this._destroy(err || null, function(err2) {
      if (!cb && err2) {
        if (!_this._writableState) {
          pna.nextTick(emitErrorNT, _this, err2);
        } else if (!_this._writableState.errorEmitted) {
          _this._writableState.errorEmitted = true;
          pna.nextTick(emitErrorNT, _this, err2);
        }
      } else if (cb) {
        cb(err2);
      }
    });
    return this;
  }
  function undestroy() {
    if (this._readableState) {
      this._readableState.destroyed = false;
      this._readableState.reading = false;
      this._readableState.ended = false;
      this._readableState.endEmitted = false;
    }
    if (this._writableState) {
      this._writableState.destroyed = false;
      this._writableState.ended = false;
      this._writableState.ending = false;
      this._writableState.finalCalled = false;
      this._writableState.prefinished = false;
      this._writableState.finished = false;
      this._writableState.errorEmitted = false;
    }
  }
  function emitErrorNT(self2, err) {
    self2.emit("error", err);
  }
  destroy_1 = {
    destroy,
    undestroy
  };
  return destroy_1;
}
var _stream_writable;
var hasRequired_stream_writable;
function require_stream_writable() {
  if (hasRequired_stream_writable) return _stream_writable;
  hasRequired_stream_writable = 1;
  var pna = requireProcessNextickArgs();
  _stream_writable = Writable;
  function CorkedRequest(state) {
    var _this = this;
    this.next = null;
    this.entry = null;
    this.finish = function() {
      onCorkedFinish(_this, state);
    };
  }
  var asyncWrite = !process.browser && ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
  var Duplex;
  Writable.WritableState = WritableState;
  var util2 = Object.create(requireUtil());
  util2.inherits = require$$2;
  var internalUtil = {
    deprecate: require$$3$1
  };
  var Stream = requireStream();
  var Buffer2 = require$$0$6.Buffer;
  var OurUint8Array = (typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var destroyImpl = requireDestroy();
  util2.inherits(Writable, Stream);
  function nop() {
  }
  function WritableState(options, stream2) {
    Duplex = Duplex || require_stream_duplex();
    options = options || {};
    var isDuplex = stream2 instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
    var hwm = options.highWaterMark;
    var writableHwm = options.writableHighWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    if (hwm || hwm === 0) this.highWaterMark = hwm;
    else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;
    else this.highWaterMark = defaultHwm;
    this.highWaterMark = Math.floor(this.highWaterMark);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function(er) {
      onwrite(stream2, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
    this.bufferedRequestCount = 0;
    this.corkedRequestsFree = new CorkedRequest(this);
  }
  WritableState.prototype.getBuffer = function getBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  };
  (function() {
    try {
      Object.defineProperty(WritableState.prototype, "buffer", {
        get: internalUtil.deprecate(function() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch (_) {
    }
  })();
  var realHasInstance;
  if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
    realHasInstance = Function.prototype[Symbol.hasInstance];
    Object.defineProperty(Writable, Symbol.hasInstance, {
      value: function(object) {
        if (realHasInstance.call(this, object)) return true;
        if (this !== Writable) return false;
        return object && object._writableState instanceof WritableState;
      }
    });
  } else {
    realHasInstance = function(object) {
      return object instanceof this;
    };
  }
  function Writable(options) {
    Duplex = Duplex || require_stream_duplex();
    if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
      return new Writable(options);
    }
    this._writableState = new WritableState(options, this);
    this.writable = true;
    if (options) {
      if (typeof options.write === "function") this._write = options.write;
      if (typeof options.writev === "function") this._writev = options.writev;
      if (typeof options.destroy === "function") this._destroy = options.destroy;
      if (typeof options.final === "function") this._final = options.final;
    }
    Stream.call(this);
  }
  Writable.prototype.pipe = function() {
    this.emit("error", new Error("Cannot pipe, not readable"));
  };
  function writeAfterEnd(stream2, cb) {
    var er = new Error("write after end");
    stream2.emit("error", er);
    pna.nextTick(cb, er);
  }
  function validChunk(stream2, state, chunk, cb) {
    var valid = true;
    var er = false;
    if (chunk === null) {
      er = new TypeError("May not write null values to stream");
    } else if (typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
      er = new TypeError("Invalid non-string/buffer chunk");
    }
    if (er) {
      stream2.emit("error", er);
      pna.nextTick(cb, er);
      valid = false;
    }
    return valid;
  }
  Writable.prototype.write = function(chunk, encoding, cb) {
    var state = this._writableState;
    var ret = false;
    var isBuf = !state.objectMode && _isUint8Array(chunk);
    if (isBuf && !Buffer2.isBuffer(chunk)) {
      chunk = _uint8ArrayToBuffer(chunk);
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (isBuf) encoding = "buffer";
    else if (!encoding) encoding = state.defaultEncoding;
    if (typeof cb !== "function") cb = nop;
    if (state.ended) writeAfterEnd(this, cb);
    else if (isBuf || validChunk(this, state, chunk, cb)) {
      state.pendingcb++;
      ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
    }
    return ret;
  };
  Writable.prototype.cork = function() {
    var state = this._writableState;
    state.corked++;
  };
  Writable.prototype.uncork = function() {
    var state = this._writableState;
    if (state.corked) {
      state.corked--;
      if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === "string") encoding = encoding.toLowerCase();
    if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };
  function decodeChunk(state, chunk, encoding) {
    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
      chunk = Buffer2.from(chunk, encoding);
    }
    return chunk;
  }
  Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function writeOrBuffer(stream2, state, isBuf, chunk, encoding, cb) {
    if (!isBuf) {
      var newChunk = decodeChunk(state, chunk, encoding);
      if (chunk !== newChunk) {
        isBuf = true;
        encoding = "buffer";
        chunk = newChunk;
      }
    }
    var len = state.objectMode ? 1 : chunk.length;
    state.length += len;
    var ret = state.length < state.highWaterMark;
    if (!ret) state.needDrain = true;
    if (state.writing || state.corked) {
      var last = state.lastBufferedRequest;
      state.lastBufferedRequest = {
        chunk,
        encoding,
        isBuf,
        callback: cb,
        next: null
      };
      if (last) {
        last.next = state.lastBufferedRequest;
      } else {
        state.bufferedRequest = state.lastBufferedRequest;
      }
      state.bufferedRequestCount += 1;
    } else {
      doWrite(stream2, state, false, len, chunk, encoding, cb);
    }
    return ret;
  }
  function doWrite(stream2, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (writev) stream2._writev(chunk, state.onwrite);
    else stream2._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }
  function onwriteError(stream2, state, sync, er, cb) {
    --state.pendingcb;
    if (sync) {
      pna.nextTick(cb, er);
      pna.nextTick(finishMaybe, stream2, state);
      stream2._writableState.errorEmitted = true;
      stream2.emit("error", er);
    } else {
      cb(er);
      stream2._writableState.errorEmitted = true;
      stream2.emit("error", er);
      finishMaybe(stream2, state);
    }
  }
  function onwriteStateUpdate(state) {
    state.writing = false;
    state.writecb = null;
    state.length -= state.writelen;
    state.writelen = 0;
  }
  function onwrite(stream2, er) {
    var state = stream2._writableState;
    var sync = state.sync;
    var cb = state.writecb;
    onwriteStateUpdate(state);
    if (er) onwriteError(stream2, state, sync, er, cb);
    else {
      var finished = needFinish(state);
      if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
        clearBuffer(stream2, state);
      }
      if (sync) {
        asyncWrite(afterWrite, stream2, state, finished, cb);
      } else {
        afterWrite(stream2, state, finished, cb);
      }
    }
  }
  function afterWrite(stream2, state, finished, cb) {
    if (!finished) onwriteDrain(stream2, state);
    state.pendingcb--;
    cb();
    finishMaybe(stream2, state);
  }
  function onwriteDrain(stream2, state) {
    if (state.length === 0 && state.needDrain) {
      state.needDrain = false;
      stream2.emit("drain");
    }
  }
  function clearBuffer(stream2, state) {
    state.bufferProcessing = true;
    var entry = state.bufferedRequest;
    if (stream2._writev && entry && entry.next) {
      var l = state.bufferedRequestCount;
      var buffer = new Array(l);
      var holder = state.corkedRequestsFree;
      holder.entry = entry;
      var count = 0;
      var allBuffers = true;
      while (entry) {
        buffer[count] = entry;
        if (!entry.isBuf) allBuffers = false;
        entry = entry.next;
        count += 1;
      }
      buffer.allBuffers = allBuffers;
      doWrite(stream2, state, true, state.length, buffer, "", holder.finish);
      state.pendingcb++;
      state.lastBufferedRequest = null;
      if (holder.next) {
        state.corkedRequestsFree = holder.next;
        holder.next = null;
      } else {
        state.corkedRequestsFree = new CorkedRequest(state);
      }
      state.bufferedRequestCount = 0;
    } else {
      while (entry) {
        var chunk = entry.chunk;
        var encoding = entry.encoding;
        var cb = entry.callback;
        var len = state.objectMode ? 1 : chunk.length;
        doWrite(stream2, state, false, len, chunk, encoding, cb);
        entry = entry.next;
        state.bufferedRequestCount--;
        if (state.writing) {
          break;
        }
      }
      if (entry === null) state.lastBufferedRequest = null;
    }
    state.bufferedRequest = entry;
    state.bufferProcessing = false;
  }
  Writable.prototype._write = function(chunk, encoding, cb) {
    cb(new Error("_write() is not implemented"));
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function(chunk, encoding, cb) {
    var state = this._writableState;
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (chunk !== null && chunk !== void 0) this.write(chunk, encoding);
    if (state.corked) {
      state.corked = 1;
      this.uncork();
    }
    if (!state.ending) endWritable(this, state, cb);
  };
  function needFinish(state) {
    return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
  }
  function callFinal(stream2, state) {
    stream2._final(function(err) {
      state.pendingcb--;
      if (err) {
        stream2.emit("error", err);
      }
      state.prefinished = true;
      stream2.emit("prefinish");
      finishMaybe(stream2, state);
    });
  }
  function prefinish(stream2, state) {
    if (!state.prefinished && !state.finalCalled) {
      if (typeof stream2._final === "function") {
        state.pendingcb++;
        state.finalCalled = true;
        pna.nextTick(callFinal, stream2, state);
      } else {
        state.prefinished = true;
        stream2.emit("prefinish");
      }
    }
  }
  function finishMaybe(stream2, state) {
    var need = needFinish(state);
    if (need) {
      prefinish(stream2, state);
      if (state.pendingcb === 0) {
        state.finished = true;
        stream2.emit("finish");
      }
    }
    return need;
  }
  function endWritable(stream2, state, cb) {
    state.ending = true;
    finishMaybe(stream2, state);
    if (cb) {
      if (state.finished) pna.nextTick(cb);
      else stream2.once("finish", cb);
    }
    state.ended = true;
    stream2.writable = false;
  }
  function onCorkedFinish(corkReq, state, err) {
    var entry = corkReq.entry;
    corkReq.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    state.corkedRequestsFree.next = corkReq;
  }
  Object.defineProperty(Writable.prototype, "destroyed", {
    get: function() {
      if (this._writableState === void 0) {
        return false;
      }
      return this._writableState.destroyed;
    },
    set: function(value) {
      if (!this._writableState) {
        return;
      }
      this._writableState.destroyed = value;
    }
  });
  Writable.prototype.destroy = destroyImpl.destroy;
  Writable.prototype._undestroy = destroyImpl.undestroy;
  Writable.prototype._destroy = function(err, cb) {
    this.end();
    cb(err);
  };
  return _stream_writable;
}
var _stream_duplex;
var hasRequired_stream_duplex;
function require_stream_duplex() {
  if (hasRequired_stream_duplex) return _stream_duplex;
  hasRequired_stream_duplex = 1;
  var pna = requireProcessNextickArgs();
  var objectKeys = Object.keys || function(obj) {
    var keys2 = [];
    for (var key in obj) {
      keys2.push(key);
    }
    return keys2;
  };
  _stream_duplex = Duplex;
  var util2 = Object.create(requireUtil());
  util2.inherits = require$$2;
  var Readable = require_stream_readable();
  var Writable = require_stream_writable();
  util2.inherits(Duplex, Readable);
  {
    var keys = objectKeys(Writable.prototype);
    for (var v = 0; v < keys.length; v++) {
      var method = keys[v];
      if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
    }
  }
  function Duplex(options) {
    if (!(this instanceof Duplex)) return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    if (options && options.readable === false) this.readable = false;
    if (options && options.writable === false) this.writable = false;
    this.allowHalfOpen = true;
    if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
    this.once("end", onend);
  }
  Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function onend() {
    if (this.allowHalfOpen || this._writableState.ended) return;
    pna.nextTick(onEndNT, this);
  }
  function onEndNT(self2) {
    self2.end();
  }
  Object.defineProperty(Duplex.prototype, "destroyed", {
    get: function() {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return false;
      }
      return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function(value) {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return;
      }
      this._readableState.destroyed = value;
      this._writableState.destroyed = value;
    }
  });
  Duplex.prototype._destroy = function(err, cb) {
    this.push(null);
    this.end();
    pna.nextTick(cb, err);
  };
  return _stream_duplex;
}
var string_decoder = {};
var hasRequiredString_decoder;
function requireString_decoder() {
  if (hasRequiredString_decoder) return string_decoder;
  hasRequiredString_decoder = 1;
  var Buffer2 = require$$0$6.Buffer;
  var isEncoding = Buffer2.isEncoding || function(encoding) {
    encoding = "" + encoding;
    switch (encoding && encoding.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return true;
      default:
        return false;
    }
  };
  function _normalizeEncoding(enc) {
    if (!enc) return "utf8";
    var retried;
    while (true) {
      switch (enc) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return enc;
        default:
          if (retried) return;
          enc = ("" + enc).toLowerCase();
          retried = true;
      }
    }
  }
  function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);
    if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
    return nenc || enc;
  }
  string_decoder.StringDecoder = StringDecoder;
  function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    var nb;
    switch (this.encoding) {
      case "utf16le":
        this.text = utf16Text;
        this.end = utf16End;
        nb = 4;
        break;
      case "utf8":
        this.fillLast = utf8FillLast;
        nb = 4;
        break;
      case "base64":
        this.text = base64Text;
        this.end = base64End;
        nb = 3;
        break;
      default:
        this.write = simpleWrite;
        this.end = simpleEnd;
        return;
    }
    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer2.allocUnsafe(nb);
  }
  StringDecoder.prototype.write = function(buf) {
    if (buf.length === 0) return "";
    var r;
    var i;
    if (this.lastNeed) {
      r = this.fillLast(buf);
      if (r === void 0) return "";
      i = this.lastNeed;
      this.lastNeed = 0;
    } else {
      i = 0;
    }
    if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
    return r || "";
  };
  StringDecoder.prototype.end = utf8End;
  StringDecoder.prototype.text = utf8Text;
  StringDecoder.prototype.fillLast = function(buf) {
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
  };
  function utf8CheckByte(byte) {
    if (byte <= 127) return 0;
    else if (byte >> 5 === 6) return 2;
    else if (byte >> 4 === 14) return 3;
    else if (byte >> 3 === 30) return 4;
    return byte >> 6 === 2 ? -1 : -2;
  }
  function utf8CheckIncomplete(self2, buf, i) {
    var j = buf.length - 1;
    if (j < i) return 0;
    var nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) self2.lastNeed = nb - 1;
      return nb;
    }
    if (--j < i || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) self2.lastNeed = nb - 2;
      return nb;
    }
    if (--j < i || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) {
        if (nb === 2) nb = 0;
        else self2.lastNeed = nb - 3;
      }
      return nb;
    }
    return 0;
  }
  function utf8CheckExtraBytes(self2, buf, p) {
    if ((buf[0] & 192) !== 128) {
      self2.lastNeed = 0;
      return "�";
    }
    if (self2.lastNeed > 1 && buf.length > 1) {
      if ((buf[1] & 192) !== 128) {
        self2.lastNeed = 1;
        return "�";
      }
      if (self2.lastNeed > 2 && buf.length > 2) {
        if ((buf[2] & 192) !== 128) {
          self2.lastNeed = 2;
          return "�";
        }
      }
    }
  }
  function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf);
    if (r !== void 0) return r;
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, p, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
  }
  function utf8Text(buf, i) {
    var total = utf8CheckIncomplete(this, buf, i);
    if (!this.lastNeed) return buf.toString("utf8", i);
    this.lastTotal = total;
    var end = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end);
    return buf.toString("utf8", i, end);
  }
  function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) return r + "�";
    return r;
  }
  function utf16Text(buf, i) {
    if ((buf.length - i) % 2 === 0) {
      var r = buf.toString("utf16le", i);
      if (r) {
        var c = r.charCodeAt(r.length - 1);
        if (c >= 55296 && c <= 56319) {
          this.lastNeed = 2;
          this.lastTotal = 4;
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
          return r.slice(0, -1);
        }
      }
      return r;
    }
    this.lastNeed = 1;
    this.lastTotal = 2;
    this.lastChar[0] = buf[buf.length - 1];
    return buf.toString("utf16le", i, buf.length - 1);
  }
  function utf16End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) {
      var end = this.lastTotal - this.lastNeed;
      return r + this.lastChar.toString("utf16le", 0, end);
    }
    return r;
  }
  function base64Text(buf, i) {
    var n = (buf.length - i) % 3;
    if (n === 0) return buf.toString("base64", i);
    this.lastNeed = 3 - n;
    this.lastTotal = 3;
    if (n === 1) {
      this.lastChar[0] = buf[buf.length - 1];
    } else {
      this.lastChar[0] = buf[buf.length - 2];
      this.lastChar[1] = buf[buf.length - 1];
    }
    return buf.toString("base64", i, buf.length - n);
  }
  function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
    return r;
  }
  function simpleWrite(buf) {
    return buf.toString(this.encoding);
  }
  function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : "";
  }
  return string_decoder;
}
var _stream_readable;
var hasRequired_stream_readable;
function require_stream_readable() {
  if (hasRequired_stream_readable) return _stream_readable;
  hasRequired_stream_readable = 1;
  var pna = requireProcessNextickArgs();
  _stream_readable = Readable;
  var isArray = requireIsarray();
  var Duplex;
  Readable.ReadableState = ReadableState;
  require$$0$1.EventEmitter;
  var EElistenerCount = function(emitter, type) {
    return emitter.listeners(type).length;
  };
  var Stream = requireStream();
  var Buffer2 = require$$0$6.Buffer;
  var OurUint8Array = (typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var util2 = Object.create(requireUtil());
  util2.inherits = require$$2;
  var debugUtil = require$$0$2;
  var debug = void 0;
  if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog("stream");
  } else {
    debug = function() {
    };
  }
  var BufferList2 = requireBufferList();
  var destroyImpl = requireDestroy();
  var StringDecoder;
  util2.inherits(Readable, Stream);
  var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
  function prependListener(emitter, event, fn) {
    if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
    else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);
    else emitter._events[event] = [fn, emitter._events[event]];
  }
  function ReadableState(options, stream2) {
    Duplex = Duplex || require_stream_duplex();
    options = options || {};
    var isDuplex = stream2 instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
    var hwm = options.highWaterMark;
    var readableHwm = options.readableHighWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    if (hwm || hwm === 0) this.highWaterMark = hwm;
    else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;
    else this.highWaterMark = defaultHwm;
    this.highWaterMark = Math.floor(this.highWaterMark);
    this.buffer = new BufferList2();
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this.destroyed = false;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
      if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {
    Duplex = Duplex || require_stream_duplex();
    if (!(this instanceof Readable)) return new Readable(options);
    this._readableState = new ReadableState(options, this);
    this.readable = true;
    if (options) {
      if (typeof options.read === "function") this._read = options.read;
      if (typeof options.destroy === "function") this._destroy = options.destroy;
    }
    Stream.call(this);
  }
  Object.defineProperty(Readable.prototype, "destroyed", {
    get: function() {
      if (this._readableState === void 0) {
        return false;
      }
      return this._readableState.destroyed;
    },
    set: function(value) {
      if (!this._readableState) {
        return;
      }
      this._readableState.destroyed = value;
    }
  });
  Readable.prototype.destroy = destroyImpl.destroy;
  Readable.prototype._undestroy = destroyImpl.undestroy;
  Readable.prototype._destroy = function(err, cb) {
    this.push(null);
    cb(err);
  };
  Readable.prototype.push = function(chunk, encoding) {
    var state = this._readableState;
    var skipChunkCheck;
    if (!state.objectMode) {
      if (typeof chunk === "string") {
        encoding = encoding || state.defaultEncoding;
        if (encoding !== state.encoding) {
          chunk = Buffer2.from(chunk, encoding);
          encoding = "";
        }
        skipChunkCheck = true;
      }
    } else {
      skipChunkCheck = true;
    }
    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
  };
  Readable.prototype.unshift = function(chunk) {
    return readableAddChunk(this, chunk, null, true, false);
  };
  function readableAddChunk(stream2, chunk, encoding, addToFront, skipChunkCheck) {
    var state = stream2._readableState;
    if (chunk === null) {
      state.reading = false;
      onEofChunk(stream2, state);
    } else {
      var er;
      if (!skipChunkCheck) er = chunkInvalid(state, chunk);
      if (er) {
        stream2.emit("error", er);
      } else if (state.objectMode || chunk && chunk.length > 0) {
        if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (addToFront) {
          if (state.endEmitted) stream2.emit("error", new Error("stream.unshift() after end event"));
          else addChunk(stream2, state, chunk, true);
        } else if (state.ended) {
          stream2.emit("error", new Error("stream.push() after EOF"));
        } else {
          state.reading = false;
          if (state.decoder && !encoding) {
            chunk = state.decoder.write(chunk);
            if (state.objectMode || chunk.length !== 0) addChunk(stream2, state, chunk, false);
            else maybeReadMore(stream2, state);
          } else {
            addChunk(stream2, state, chunk, false);
          }
        }
      } else if (!addToFront) {
        state.reading = false;
      }
    }
    return needMoreData(state);
  }
  function addChunk(stream2, state, chunk, addToFront) {
    if (state.flowing && state.length === 0 && !state.sync) {
      stream2.emit("data", chunk);
      stream2.read(0);
    } else {
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront) state.buffer.unshift(chunk);
      else state.buffer.push(chunk);
      if (state.needReadable) emitReadable(stream2);
    }
    maybeReadMore(stream2, state);
  }
  function chunkInvalid(state, chunk) {
    var er;
    if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
      er = new TypeError("Invalid non-string/buffer chunk");
    }
    return er;
  }
  function needMoreData(state) {
    return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
  }
  Readable.prototype.isPaused = function() {
    return this._readableState.flowing === false;
  };
  Readable.prototype.setEncoding = function(enc) {
    if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
    this._readableState.decoder = new StringDecoder(enc);
    this._readableState.encoding = enc;
    return this;
  };
  var MAX_HWM = 8388608;
  function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
      n = MAX_HWM;
    } else {
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }
  function howMuchToRead(n, state) {
    if (n <= 0 || state.length === 0 && state.ended) return 0;
    if (state.objectMode) return 1;
    if (n !== n) {
      if (state.flowing && state.length) return state.buffer.head.data.length;
      else return state.length;
    }
    if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
    if (n <= state.length) return n;
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    }
    return state.length;
  }
  Readable.prototype.read = function(n) {
    debug("read", n);
    n = parseInt(n, 10);
    var state = this._readableState;
    var nOrig = n;
    if (n !== 0) state.emittedReadable = false;
    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
      debug("read: emitReadable", state.length, state.ended);
      if (state.length === 0 && state.ended) endReadable(this);
      else emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state);
    if (n === 0 && state.ended) {
      if (state.length === 0) endReadable(this);
      return null;
    }
    var doRead = state.needReadable;
    debug("need readable", doRead);
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug("length less than watermark", doRead);
    }
    if (state.ended || state.reading) {
      doRead = false;
      debug("reading or ended", doRead);
    } else if (doRead) {
      debug("do read");
      state.reading = true;
      state.sync = true;
      if (state.length === 0) state.needReadable = true;
      this._read(state.highWaterMark);
      state.sync = false;
      if (!state.reading) n = howMuchToRead(nOrig, state);
    }
    var ret;
    if (n > 0) ret = fromList(n, state);
    else ret = null;
    if (ret === null) {
      state.needReadable = true;
      n = 0;
    } else {
      state.length -= n;
    }
    if (state.length === 0) {
      if (!state.ended) state.needReadable = true;
      if (nOrig !== n && state.ended) endReadable(this);
    }
    if (ret !== null) this.emit("data", ret);
    return ret;
  };
  function onEofChunk(stream2, state) {
    if (state.ended) return;
    if (state.decoder) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) {
        state.buffer.push(chunk);
        state.length += state.objectMode ? 1 : chunk.length;
      }
    }
    state.ended = true;
    emitReadable(stream2);
  }
  function emitReadable(stream2) {
    var state = stream2._readableState;
    state.needReadable = false;
    if (!state.emittedReadable) {
      debug("emitReadable", state.flowing);
      state.emittedReadable = true;
      if (state.sync) pna.nextTick(emitReadable_, stream2);
      else emitReadable_(stream2);
    }
  }
  function emitReadable_(stream2) {
    debug("emit readable");
    stream2.emit("readable");
    flow(stream2);
  }
  function maybeReadMore(stream2, state) {
    if (!state.readingMore) {
      state.readingMore = true;
      pna.nextTick(maybeReadMore_, stream2, state);
    }
  }
  function maybeReadMore_(stream2, state) {
    var len = state.length;
    while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
      debug("maybeReadMore read 0");
      stream2.read(0);
      if (len === state.length)
        break;
      else len = state.length;
    }
    state.readingMore = false;
  }
  Readable.prototype._read = function(n) {
    this.emit("error", new Error("_read() is not implemented"));
  };
  Readable.prototype.pipe = function(dest, pipeOpts) {
    var src = this;
    var state = this._readableState;
    switch (state.pipesCount) {
      case 0:
        state.pipes = dest;
        break;
      case 1:
        state.pipes = [state.pipes, dest];
        break;
      default:
        state.pipes.push(dest);
        break;
    }
    state.pipesCount += 1;
    debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    var endFn = doEnd ? onend : unpipe;
    if (state.endEmitted) pna.nextTick(endFn);
    else src.once("end", endFn);
    dest.on("unpipe", onunpipe);
    function onunpipe(readable2, unpipeInfo) {
      debug("onunpipe");
      if (readable2 === src) {
        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
          unpipeInfo.hasUnpiped = true;
          cleanup();
        }
      }
    }
    function onend() {
      debug("onend");
      dest.end();
    }
    var ondrain = pipeOnDrain(src);
    dest.on("drain", ondrain);
    var cleanedUp = false;
    function cleanup() {
      debug("cleanup");
      dest.removeListener("close", onclose);
      dest.removeListener("finish", onfinish);
      dest.removeListener("drain", ondrain);
      dest.removeListener("error", onerror);
      dest.removeListener("unpipe", onunpipe);
      src.removeListener("end", onend);
      src.removeListener("end", unpipe);
      src.removeListener("data", ondata);
      cleanedUp = true;
      if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
    }
    var increasedAwaitDrain = false;
    src.on("data", ondata);
    function ondata(chunk) {
      debug("ondata");
      increasedAwaitDrain = false;
      var ret = dest.write(chunk);
      if (false === ret && !increasedAwaitDrain) {
        if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
          debug("false write response, pause", state.awaitDrain);
          state.awaitDrain++;
          increasedAwaitDrain = true;
        }
        src.pause();
      }
    }
    function onerror(er) {
      debug("onerror", er);
      unpipe();
      dest.removeListener("error", onerror);
      if (EElistenerCount(dest, "error") === 0) dest.emit("error", er);
    }
    prependListener(dest, "error", onerror);
    function onclose() {
      dest.removeListener("finish", onfinish);
      unpipe();
    }
    dest.once("close", onclose);
    function onfinish() {
      debug("onfinish");
      dest.removeListener("close", onclose);
      unpipe();
    }
    dest.once("finish", onfinish);
    function unpipe() {
      debug("unpipe");
      src.unpipe(dest);
    }
    dest.emit("pipe", src);
    if (!state.flowing) {
      debug("pipe resume");
      src.resume();
    }
    return dest;
  };
  function pipeOnDrain(src) {
    return function() {
      var state = src._readableState;
      debug("pipeOnDrain", state.awaitDrain);
      if (state.awaitDrain) state.awaitDrain--;
      if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
        state.flowing = true;
        flow(src);
      }
    };
  }
  Readable.prototype.unpipe = function(dest) {
    var state = this._readableState;
    var unpipeInfo = { hasUnpiped: false };
    if (state.pipesCount === 0) return this;
    if (state.pipesCount === 1) {
      if (dest && dest !== state.pipes) return this;
      if (!dest) dest = state.pipes;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      if (dest) dest.emit("unpipe", this, unpipeInfo);
      return this;
    }
    if (!dest) {
      var dests = state.pipes;
      var len = state.pipesCount;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      for (var i = 0; i < len; i++) {
        dests[i].emit("unpipe", this, { hasUnpiped: false });
      }
      return this;
    }
    var index = indexOf(state.pipes, dest);
    if (index === -1) return this;
    state.pipes.splice(index, 1);
    state.pipesCount -= 1;
    if (state.pipesCount === 1) state.pipes = state.pipes[0];
    dest.emit("unpipe", this, unpipeInfo);
    return this;
  };
  Readable.prototype.on = function(ev, fn) {
    var res = Stream.prototype.on.call(this, ev, fn);
    if (ev === "data") {
      if (this._readableState.flowing !== false) this.resume();
    } else if (ev === "readable") {
      var state = this._readableState;
      if (!state.endEmitted && !state.readableListening) {
        state.readableListening = state.needReadable = true;
        state.emittedReadable = false;
        if (!state.reading) {
          pna.nextTick(nReadingNextTick, this);
        } else if (state.length) {
          emitReadable(this);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  function nReadingNextTick(self2) {
    debug("readable nexttick read 0");
    self2.read(0);
  }
  Readable.prototype.resume = function() {
    var state = this._readableState;
    if (!state.flowing) {
      debug("resume");
      state.flowing = true;
      resume(this, state);
    }
    return this;
  };
  function resume(stream2, state) {
    if (!state.resumeScheduled) {
      state.resumeScheduled = true;
      pna.nextTick(resume_, stream2, state);
    }
  }
  function resume_(stream2, state) {
    if (!state.reading) {
      debug("resume read 0");
      stream2.read(0);
    }
    state.resumeScheduled = false;
    state.awaitDrain = 0;
    stream2.emit("resume");
    flow(stream2);
    if (state.flowing && !state.reading) stream2.read(0);
  }
  Readable.prototype.pause = function() {
    debug("call pause flowing=%j", this._readableState.flowing);
    if (false !== this._readableState.flowing) {
      debug("pause");
      this._readableState.flowing = false;
      this.emit("pause");
    }
    return this;
  };
  function flow(stream2) {
    var state = stream2._readableState;
    debug("flow", state.flowing);
    while (state.flowing && stream2.read() !== null) {
    }
  }
  Readable.prototype.wrap = function(stream2) {
    var _this = this;
    var state = this._readableState;
    var paused = false;
    stream2.on("end", function() {
      debug("wrapped end");
      if (state.decoder && !state.ended) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) _this.push(chunk);
      }
      _this.push(null);
    });
    stream2.on("data", function(chunk) {
      debug("wrapped data");
      if (state.decoder) chunk = state.decoder.write(chunk);
      if (state.objectMode && (chunk === null || chunk === void 0)) return;
      else if (!state.objectMode && (!chunk || !chunk.length)) return;
      var ret = _this.push(chunk);
      if (!ret) {
        paused = true;
        stream2.pause();
      }
    });
    for (var i in stream2) {
      if (this[i] === void 0 && typeof stream2[i] === "function") {
        this[i] = /* @__PURE__ */ function(method) {
          return function() {
            return stream2[method].apply(stream2, arguments);
          };
        }(i);
      }
    }
    for (var n = 0; n < kProxyEvents.length; n++) {
      stream2.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
    }
    this._read = function(n2) {
      debug("wrapped _read", n2);
      if (paused) {
        paused = false;
        stream2.resume();
      }
    };
    return this;
  };
  Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function() {
      return this._readableState.highWaterMark;
    }
  });
  Readable._fromList = fromList;
  function fromList(n, state) {
    if (state.length === 0) return null;
    var ret;
    if (state.objectMode) ret = state.buffer.shift();
    else if (!n || n >= state.length) {
      if (state.decoder) ret = state.buffer.join("");
      else if (state.buffer.length === 1) ret = state.buffer.head.data;
      else ret = state.buffer.concat(state.length);
      state.buffer.clear();
    } else {
      ret = fromListPartial(n, state.buffer, state.decoder);
    }
    return ret;
  }
  function fromListPartial(n, list, hasStrings) {
    var ret;
    if (n < list.head.data.length) {
      ret = list.head.data.slice(0, n);
      list.head.data = list.head.data.slice(n);
    } else if (n === list.head.data.length) {
      ret = list.shift();
    } else {
      ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
    }
    return ret;
  }
  function copyFromBufferString(n, list) {
    var p = list.head;
    var c = 1;
    var ret = p.data;
    n -= ret.length;
    while (p = p.next) {
      var str = p.data;
      var nb = n > str.length ? str.length : n;
      if (nb === str.length) ret += str;
      else ret += str.slice(0, n);
      n -= nb;
      if (n === 0) {
        if (nb === str.length) {
          ++c;
          if (p.next) list.head = p.next;
          else list.head = list.tail = null;
        } else {
          list.head = p;
          p.data = str.slice(nb);
        }
        break;
      }
      ++c;
    }
    list.length -= c;
    return ret;
  }
  function copyFromBuffer(n, list) {
    var ret = Buffer2.allocUnsafe(n);
    var p = list.head;
    var c = 1;
    p.data.copy(ret);
    n -= p.data.length;
    while (p = p.next) {
      var buf = p.data;
      var nb = n > buf.length ? buf.length : n;
      buf.copy(ret, ret.length - n, 0, nb);
      n -= nb;
      if (n === 0) {
        if (nb === buf.length) {
          ++c;
          if (p.next) list.head = p.next;
          else list.head = list.tail = null;
        } else {
          list.head = p;
          p.data = buf.slice(nb);
        }
        break;
      }
      ++c;
    }
    list.length -= c;
    return ret;
  }
  function endReadable(stream2) {
    var state = stream2._readableState;
    if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');
    if (!state.endEmitted) {
      state.ended = true;
      pna.nextTick(endReadableNT, state, stream2);
    }
  }
  function endReadableNT(state, stream2) {
    if (!state.endEmitted && state.length === 0) {
      state.endEmitted = true;
      stream2.readable = false;
      stream2.emit("end");
    }
  }
  function indexOf(xs, x) {
    for (var i = 0, l = xs.length; i < l; i++) {
      if (xs[i] === x) return i;
    }
    return -1;
  }
  return _stream_readable;
}
var _stream_transform;
var hasRequired_stream_transform;
function require_stream_transform() {
  if (hasRequired_stream_transform) return _stream_transform;
  hasRequired_stream_transform = 1;
  _stream_transform = Transform;
  var Duplex = require_stream_duplex();
  var util2 = Object.create(requireUtil());
  util2.inherits = require$$2;
  util2.inherits(Transform, Duplex);
  function afterTransform(er, data) {
    var ts = this._transformState;
    ts.transforming = false;
    var cb = ts.writecb;
    if (!cb) {
      return this.emit("error", new Error("write callback called multiple times"));
    }
    ts.writechunk = null;
    ts.writecb = null;
    if (data != null)
      this.push(data);
    cb(er);
    var rs = this._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
      this._read(rs.highWaterMark);
    }
  }
  function Transform(options) {
    if (!(this instanceof Transform)) return new Transform(options);
    Duplex.call(this, options);
    this._transformState = {
      afterTransform: afterTransform.bind(this),
      needTransform: false,
      transforming: false,
      writecb: null,
      writechunk: null,
      writeencoding: null
    };
    this._readableState.needReadable = true;
    this._readableState.sync = false;
    if (options) {
      if (typeof options.transform === "function") this._transform = options.transform;
      if (typeof options.flush === "function") this._flush = options.flush;
    }
    this.on("prefinish", prefinish);
  }
  function prefinish() {
    var _this = this;
    if (typeof this._flush === "function") {
      this._flush(function(er, data) {
        done(_this, er, data);
      });
    } else {
      done(this, null, null);
    }
  }
  Transform.prototype.push = function(chunk, encoding) {
    this._transformState.needTransform = false;
    return Duplex.prototype.push.call(this, chunk, encoding);
  };
  Transform.prototype._transform = function(chunk, encoding, cb) {
    throw new Error("_transform() is not implemented");
  };
  Transform.prototype._write = function(chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
      var rs = this._readableState;
      if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
    }
  };
  Transform.prototype._read = function(n) {
    var ts = this._transformState;
    if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
      ts.transforming = true;
      this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    } else {
      ts.needTransform = true;
    }
  };
  Transform.prototype._destroy = function(err, cb) {
    var _this2 = this;
    Duplex.prototype._destroy.call(this, err, function(err2) {
      cb(err2);
      _this2.emit("close");
    });
  };
  function done(stream2, er, data) {
    if (er) return stream2.emit("error", er);
    if (data != null)
      stream2.push(data);
    if (stream2._writableState.length) throw new Error("Calling transform done when ws.length != 0");
    if (stream2._transformState.transforming) throw new Error("Calling transform done when still transforming");
    return stream2.push(null);
  }
  return _stream_transform;
}
var _stream_passthrough;
var hasRequired_stream_passthrough;
function require_stream_passthrough() {
  if (hasRequired_stream_passthrough) return _stream_passthrough;
  hasRequired_stream_passthrough = 1;
  _stream_passthrough = PassThrough;
  var Transform = require_stream_transform();
  var util2 = Object.create(requireUtil());
  util2.inherits = require$$2;
  util2.inherits(PassThrough, Transform);
  function PassThrough(options) {
    if (!(this instanceof PassThrough)) return new PassThrough(options);
    Transform.call(this, options);
  }
  PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
  };
  return _stream_passthrough;
}
var hasRequiredReadable;
function requireReadable() {
  if (hasRequiredReadable) return readable.exports;
  hasRequiredReadable = 1;
  (function(module, exports) {
    var Stream = require$$0;
    if (process.env.READABLE_STREAM === "disable" && Stream) {
      module.exports = Stream;
      exports = module.exports = Stream.Readable;
      exports.Readable = Stream.Readable;
      exports.Writable = Stream.Writable;
      exports.Duplex = Stream.Duplex;
      exports.Transform = Stream.Transform;
      exports.PassThrough = Stream.PassThrough;
      exports.Stream = Stream;
    } else {
      exports = module.exports = require_stream_readable();
      exports.Stream = Stream || exports;
      exports.Readable = exports;
      exports.Writable = require_stream_writable();
      exports.Duplex = require_stream_duplex();
      exports.Transform = require_stream_transform();
      exports.PassThrough = require_stream_passthrough();
    }
  })(readable, readable.exports);
  return readable.exports;
}
var bufferFrom_1;
var hasRequiredBufferFrom;
function requireBufferFrom() {
  if (hasRequiredBufferFrom) return bufferFrom_1;
  hasRequiredBufferFrom = 1;
  var toString = Object.prototype.toString;
  var isModern = typeof Buffer !== "undefined" && typeof Buffer.alloc === "function" && typeof Buffer.allocUnsafe === "function" && typeof Buffer.from === "function";
  function isArrayBuffer(input) {
    return toString.call(input).slice(8, -1) === "ArrayBuffer";
  }
  function fromArrayBuffer(obj, byteOffset, length) {
    byteOffset >>>= 0;
    var maxLength = obj.byteLength - byteOffset;
    if (maxLength < 0) {
      throw new RangeError("'offset' is out of bounds");
    }
    if (length === void 0) {
      length = maxLength;
    } else {
      length >>>= 0;
      if (length > maxLength) {
        throw new RangeError("'length' is out of bounds");
      }
    }
    return isModern ? Buffer.from(obj.slice(byteOffset, byteOffset + length)) : new Buffer(new Uint8Array(obj.slice(byteOffset, byteOffset + length)));
  }
  function fromString(string, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
      encoding = "utf8";
    }
    if (!Buffer.isEncoding(encoding)) {
      throw new TypeError('"encoding" must be a valid string encoding');
    }
    return isModern ? Buffer.from(string, encoding) : new Buffer(string, encoding);
  }
  function bufferFrom(value, encodingOrOffset, length) {
    if (typeof value === "number") {
      throw new TypeError('"value" argument must not be a number');
    }
    if (isArrayBuffer(value)) {
      return fromArrayBuffer(value, encodingOrOffset, length);
    }
    if (typeof value === "string") {
      return fromString(value, encodingOrOffset);
    }
    return isModern ? Buffer.from(value) : new Buffer(value);
  }
  bufferFrom_1 = bufferFrom;
  return bufferFrom_1;
}
var typedarray = {};
var hasRequiredTypedarray;
function requireTypedarray() {
  if (hasRequiredTypedarray) return typedarray;
  hasRequiredTypedarray = 1;
  (function(exports) {
    var undefined$1 = void 0;
    var MAX_ARRAY_LENGTH = 1e5;
    var ECMAScript = /* @__PURE__ */ function() {
      var opts = Object.prototype.toString, ophop = Object.prototype.hasOwnProperty;
      return {
        // Class returns internal [[Class]] property, used to avoid cross-frame instanceof issues:
        Class: function(v) {
          return opts.call(v).replace(/^\[object *|\]$/g, "");
        },
        HasProperty: function(o, p) {
          return p in o;
        },
        HasOwnProperty: function(o, p) {
          return ophop.call(o, p);
        },
        IsCallable: function(o) {
          return typeof o === "function";
        },
        ToInt32: function(v) {
          return v >> 0;
        },
        ToUint32: function(v) {
          return v >>> 0;
        }
      };
    }();
    var LN2 = Math.LN2, abs = Math.abs, floor = Math.floor, log = Math.log, min = Math.min, pow = Math.pow, round = Math.round;
    function configureProperties(obj) {
      if (getOwnPropNames && defineProp) {
        var props = getOwnPropNames(obj), i;
        for (i = 0; i < props.length; i += 1) {
          defineProp(obj, props[i], {
            value: obj[props[i]],
            writable: false,
            enumerable: false,
            configurable: false
          });
        }
      }
    }
    var defineProp;
    if (Object.defineProperty && function() {
      try {
        Object.defineProperty({}, "x", {});
        return true;
      } catch (e) {
        return false;
      }
    }()) {
      defineProp = Object.defineProperty;
    } else {
      defineProp = function(o, p, desc) {
        if (!o === Object(o)) throw new TypeError("Object.defineProperty called on non-object");
        if (ECMAScript.HasProperty(desc, "get") && Object.prototype.__defineGetter__) {
          Object.prototype.__defineGetter__.call(o, p, desc.get);
        }
        if (ECMAScript.HasProperty(desc, "set") && Object.prototype.__defineSetter__) {
          Object.prototype.__defineSetter__.call(o, p, desc.set);
        }
        if (ECMAScript.HasProperty(desc, "value")) {
          o[p] = desc.value;
        }
        return o;
      };
    }
    var getOwnPropNames = Object.getOwnPropertyNames || function(o) {
      if (o !== Object(o)) throw new TypeError("Object.getOwnPropertyNames called on non-object");
      var props = [], p;
      for (p in o) {
        if (ECMAScript.HasOwnProperty(o, p)) {
          props.push(p);
        }
      }
      return props;
    };
    function makeArrayAccessors(obj) {
      if (!defineProp) {
        return;
      }
      if (obj.length > MAX_ARRAY_LENGTH) throw new RangeError("Array too large for polyfill");
      function makeArrayAccessor(index) {
        defineProp(obj, index, {
          "get": function() {
            return obj._getter(index);
          },
          "set": function(v) {
            obj._setter(index, v);
          },
          enumerable: true,
          configurable: false
        });
      }
      var i;
      for (i = 0; i < obj.length; i += 1) {
        makeArrayAccessor(i);
      }
    }
    function as_signed(value, bits) {
      var s = 32 - bits;
      return value << s >> s;
    }
    function as_unsigned(value, bits) {
      var s = 32 - bits;
      return value << s >>> s;
    }
    function packI8(n) {
      return [n & 255];
    }
    function unpackI8(bytes) {
      return as_signed(bytes[0], 8);
    }
    function packU8(n) {
      return [n & 255];
    }
    function unpackU8(bytes) {
      return as_unsigned(bytes[0], 8);
    }
    function packU8Clamped(n) {
      n = round(Number(n));
      return [n < 0 ? 0 : n > 255 ? 255 : n & 255];
    }
    function packI16(n) {
      return [n >> 8 & 255, n & 255];
    }
    function unpackI16(bytes) {
      return as_signed(bytes[0] << 8 | bytes[1], 16);
    }
    function packU16(n) {
      return [n >> 8 & 255, n & 255];
    }
    function unpackU16(bytes) {
      return as_unsigned(bytes[0] << 8 | bytes[1], 16);
    }
    function packI32(n) {
      return [n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, n & 255];
    }
    function unpackI32(bytes) {
      return as_signed(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32);
    }
    function packU32(n) {
      return [n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, n & 255];
    }
    function unpackU32(bytes) {
      return as_unsigned(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32);
    }
    function packIEEE754(v, ebits, fbits) {
      var bias = (1 << ebits - 1) - 1, s, e, f, i, bits, str, bytes;
      function roundToEven(n) {
        var w = floor(n), f2 = n - w;
        if (f2 < 0.5)
          return w;
        if (f2 > 0.5)
          return w + 1;
        return w % 2 ? w + 1 : w;
      }
      if (v !== v) {
        e = (1 << ebits) - 1;
        f = pow(2, fbits - 1);
        s = 0;
      } else if (v === Infinity || v === -Infinity) {
        e = (1 << ebits) - 1;
        f = 0;
        s = v < 0 ? 1 : 0;
      } else if (v === 0) {
        e = 0;
        f = 0;
        s = 1 / v === -Infinity ? 1 : 0;
      } else {
        s = v < 0;
        v = abs(v);
        if (v >= pow(2, 1 - bias)) {
          e = min(floor(log(v) / LN2), 1023);
          f = roundToEven(v / pow(2, e) * pow(2, fbits));
          if (f / pow(2, fbits) >= 2) {
            e = e + 1;
            f = 1;
          }
          if (e > bias) {
            e = (1 << ebits) - 1;
            f = 0;
          } else {
            e = e + bias;
            f = f - pow(2, fbits);
          }
        } else {
          e = 0;
          f = roundToEven(v / pow(2, 1 - bias - fbits));
        }
      }
      bits = [];
      for (i = fbits; i; i -= 1) {
        bits.push(f % 2 ? 1 : 0);
        f = floor(f / 2);
      }
      for (i = ebits; i; i -= 1) {
        bits.push(e % 2 ? 1 : 0);
        e = floor(e / 2);
      }
      bits.push(s ? 1 : 0);
      bits.reverse();
      str = bits.join("");
      bytes = [];
      while (str.length) {
        bytes.push(parseInt(str.substring(0, 8), 2));
        str = str.substring(8);
      }
      return bytes;
    }
    function unpackIEEE754(bytes, ebits, fbits) {
      var bits = [], i, j, b, str, bias, s, e, f;
      for (i = bytes.length; i; i -= 1) {
        b = bytes[i - 1];
        for (j = 8; j; j -= 1) {
          bits.push(b % 2 ? 1 : 0);
          b = b >> 1;
        }
      }
      bits.reverse();
      str = bits.join("");
      bias = (1 << ebits - 1) - 1;
      s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
      e = parseInt(str.substring(1, 1 + ebits), 2);
      f = parseInt(str.substring(1 + ebits), 2);
      if (e === (1 << ebits) - 1) {
        return f !== 0 ? NaN : s * Infinity;
      } else if (e > 0) {
        return s * pow(2, e - bias) * (1 + f / pow(2, fbits));
      } else if (f !== 0) {
        return s * pow(2, -(bias - 1)) * (f / pow(2, fbits));
      } else {
        return s < 0 ? -0 : 0;
      }
    }
    function unpackF64(b) {
      return unpackIEEE754(b, 11, 52);
    }
    function packF64(v) {
      return packIEEE754(v, 11, 52);
    }
    function unpackF32(b) {
      return unpackIEEE754(b, 8, 23);
    }
    function packF32(v) {
      return packIEEE754(v, 8, 23);
    }
    (function() {
      var ArrayBuffer = function ArrayBuffer2(length) {
        length = ECMAScript.ToInt32(length);
        if (length < 0) throw new RangeError("ArrayBuffer size is not a small enough positive integer");
        this.byteLength = length;
        this._bytes = [];
        this._bytes.length = length;
        var i;
        for (i = 0; i < this.byteLength; i += 1) {
          this._bytes[i] = 0;
        }
        configureProperties(this);
      };
      exports.ArrayBuffer = exports.ArrayBuffer || ArrayBuffer;
      var ArrayBufferView = function ArrayBufferView2() {
      };
      function makeConstructor(bytesPerElement, pack, unpack) {
        var ctor;
        ctor = function(buffer, byteOffset, length) {
          var array, sequence, i, s;
          if (!arguments.length || typeof arguments[0] === "number") {
            this.length = ECMAScript.ToInt32(arguments[0]);
            if (length < 0) throw new RangeError("ArrayBufferView size is not a small enough positive integer");
            this.byteLength = this.length * this.BYTES_PER_ELEMENT;
            this.buffer = new ArrayBuffer(this.byteLength);
            this.byteOffset = 0;
          } else if (typeof arguments[0] === "object" && arguments[0].constructor === ctor) {
            array = arguments[0];
            this.length = array.length;
            this.byteLength = this.length * this.BYTES_PER_ELEMENT;
            this.buffer = new ArrayBuffer(this.byteLength);
            this.byteOffset = 0;
            for (i = 0; i < this.length; i += 1) {
              this._setter(i, array._getter(i));
            }
          } else if (typeof arguments[0] === "object" && !(arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === "ArrayBuffer")) {
            sequence = arguments[0];
            this.length = ECMAScript.ToUint32(sequence.length);
            this.byteLength = this.length * this.BYTES_PER_ELEMENT;
            this.buffer = new ArrayBuffer(this.byteLength);
            this.byteOffset = 0;
            for (i = 0; i < this.length; i += 1) {
              s = sequence[i];
              this._setter(i, Number(s));
            }
          } else if (typeof arguments[0] === "object" && (arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === "ArrayBuffer")) {
            this.buffer = buffer;
            this.byteOffset = ECMAScript.ToUint32(byteOffset);
            if (this.byteOffset > this.buffer.byteLength) {
              throw new RangeError("byteOffset out of range");
            }
            if (this.byteOffset % this.BYTES_PER_ELEMENT) {
              throw new RangeError("ArrayBuffer length minus the byteOffset is not a multiple of the element size.");
            }
            if (arguments.length < 3) {
              this.byteLength = this.buffer.byteLength - this.byteOffset;
              if (this.byteLength % this.BYTES_PER_ELEMENT) {
                throw new RangeError("length of buffer minus byteOffset not a multiple of the element size");
              }
              this.length = this.byteLength / this.BYTES_PER_ELEMENT;
            } else {
              this.length = ECMAScript.ToUint32(length);
              this.byteLength = this.length * this.BYTES_PER_ELEMENT;
            }
            if (this.byteOffset + this.byteLength > this.buffer.byteLength) {
              throw new RangeError("byteOffset and length reference an area beyond the end of the buffer");
            }
          } else {
            throw new TypeError("Unexpected argument type(s)");
          }
          this.constructor = ctor;
          configureProperties(this);
          makeArrayAccessors(this);
        };
        ctor.prototype = new ArrayBufferView();
        ctor.prototype.BYTES_PER_ELEMENT = bytesPerElement;
        ctor.prototype._pack = pack;
        ctor.prototype._unpack = unpack;
        ctor.BYTES_PER_ELEMENT = bytesPerElement;
        ctor.prototype._getter = function(index) {
          if (arguments.length < 1) throw new SyntaxError("Not enough arguments");
          index = ECMAScript.ToUint32(index);
          if (index >= this.length) {
            return undefined$1;
          }
          var bytes = [], i, o;
          for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT; i < this.BYTES_PER_ELEMENT; i += 1, o += 1) {
            bytes.push(this.buffer._bytes[o]);
          }
          return this._unpack(bytes);
        };
        ctor.prototype.get = ctor.prototype._getter;
        ctor.prototype._setter = function(index, value) {
          if (arguments.length < 2) throw new SyntaxError("Not enough arguments");
          index = ECMAScript.ToUint32(index);
          if (index >= this.length) {
            return undefined$1;
          }
          var bytes = this._pack(value), i, o;
          for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT; i < this.BYTES_PER_ELEMENT; i += 1, o += 1) {
            this.buffer._bytes[o] = bytes[i];
          }
        };
        ctor.prototype.set = function(index, value) {
          if (arguments.length < 1) throw new SyntaxError("Not enough arguments");
          var array, sequence, offset, len, i, s, d, byteOffset, byteLength, tmp;
          if (typeof arguments[0] === "object" && arguments[0].constructor === this.constructor) {
            array = arguments[0];
            offset = ECMAScript.ToUint32(arguments[1]);
            if (offset + array.length > this.length) {
              throw new RangeError("Offset plus length of array is out of range");
            }
            byteOffset = this.byteOffset + offset * this.BYTES_PER_ELEMENT;
            byteLength = array.length * this.BYTES_PER_ELEMENT;
            if (array.buffer === this.buffer) {
              tmp = [];
              for (i = 0, s = array.byteOffset; i < byteLength; i += 1, s += 1) {
                tmp[i] = array.buffer._bytes[s];
              }
              for (i = 0, d = byteOffset; i < byteLength; i += 1, d += 1) {
                this.buffer._bytes[d] = tmp[i];
              }
            } else {
              for (i = 0, s = array.byteOffset, d = byteOffset; i < byteLength; i += 1, s += 1, d += 1) {
                this.buffer._bytes[d] = array.buffer._bytes[s];
              }
            }
          } else if (typeof arguments[0] === "object" && typeof arguments[0].length !== "undefined") {
            sequence = arguments[0];
            len = ECMAScript.ToUint32(sequence.length);
            offset = ECMAScript.ToUint32(arguments[1]);
            if (offset + len > this.length) {
              throw new RangeError("Offset plus length of array is out of range");
            }
            for (i = 0; i < len; i += 1) {
              s = sequence[i];
              this._setter(offset + i, Number(s));
            }
          } else {
            throw new TypeError("Unexpected argument type(s)");
          }
        };
        ctor.prototype.subarray = function(start, end) {
          function clamp(v, min2, max) {
            return v < min2 ? min2 : v > max ? max : v;
          }
          start = ECMAScript.ToInt32(start);
          end = ECMAScript.ToInt32(end);
          if (arguments.length < 1) {
            start = 0;
          }
          if (arguments.length < 2) {
            end = this.length;
          }
          if (start < 0) {
            start = this.length + start;
          }
          if (end < 0) {
            end = this.length + end;
          }
          start = clamp(start, 0, this.length);
          end = clamp(end, 0, this.length);
          var len = end - start;
          if (len < 0) {
            len = 0;
          }
          return new this.constructor(
            this.buffer,
            this.byteOffset + start * this.BYTES_PER_ELEMENT,
            len
          );
        };
        return ctor;
      }
      var Int8Array = makeConstructor(1, packI8, unpackI8);
      var Uint8Array2 = makeConstructor(1, packU8, unpackU8);
      var Uint8ClampedArray = makeConstructor(1, packU8Clamped, unpackU8);
      var Int16Array = makeConstructor(2, packI16, unpackI16);
      var Uint16Array = makeConstructor(2, packU16, unpackU16);
      var Int32Array = makeConstructor(4, packI32, unpackI32);
      var Uint32Array = makeConstructor(4, packU32, unpackU32);
      var Float32Array = makeConstructor(4, packF32, unpackF32);
      var Float64Array = makeConstructor(8, packF64, unpackF64);
      exports.Int8Array = exports.Int8Array || Int8Array;
      exports.Uint8Array = exports.Uint8Array || Uint8Array2;
      exports.Uint8ClampedArray = exports.Uint8ClampedArray || Uint8ClampedArray;
      exports.Int16Array = exports.Int16Array || Int16Array;
      exports.Uint16Array = exports.Uint16Array || Uint16Array;
      exports.Int32Array = exports.Int32Array || Int32Array;
      exports.Uint32Array = exports.Uint32Array || Uint32Array;
      exports.Float32Array = exports.Float32Array || Float32Array;
      exports.Float64Array = exports.Float64Array || Float64Array;
    })();
    (function() {
      function r(array, index) {
        return ECMAScript.IsCallable(array.get) ? array.get(index) : array[index];
      }
      var IS_BIG_ENDIAN = function() {
        var u16array = new exports.Uint16Array([4660]), u8array = new exports.Uint8Array(u16array.buffer);
        return r(u8array, 0) === 18;
      }();
      var DataView = function DataView2(buffer, byteOffset, byteLength) {
        if (arguments.length === 0) {
          buffer = new exports.ArrayBuffer(0);
        } else if (!(buffer instanceof exports.ArrayBuffer || ECMAScript.Class(buffer) === "ArrayBuffer")) {
          throw new TypeError("TypeError");
        }
        this.buffer = buffer || new exports.ArrayBuffer(0);
        this.byteOffset = ECMAScript.ToUint32(byteOffset);
        if (this.byteOffset > this.buffer.byteLength) {
          throw new RangeError("byteOffset out of range");
        }
        if (arguments.length < 3) {
          this.byteLength = this.buffer.byteLength - this.byteOffset;
        } else {
          this.byteLength = ECMAScript.ToUint32(byteLength);
        }
        if (this.byteOffset + this.byteLength > this.buffer.byteLength) {
          throw new RangeError("byteOffset and length reference an area beyond the end of the buffer");
        }
        configureProperties(this);
      };
      function makeGetter(arrayType) {
        return function(byteOffset, littleEndian) {
          byteOffset = ECMAScript.ToUint32(byteOffset);
          if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
            throw new RangeError("Array index out of range");
          }
          byteOffset += this.byteOffset;
          var uint8Array = new exports.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT), bytes = [], i;
          for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
            bytes.push(r(uint8Array, i));
          }
          if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
            bytes.reverse();
          }
          return r(new arrayType(new exports.Uint8Array(bytes).buffer), 0);
        };
      }
      DataView.prototype.getUint8 = makeGetter(exports.Uint8Array);
      DataView.prototype.getInt8 = makeGetter(exports.Int8Array);
      DataView.prototype.getUint16 = makeGetter(exports.Uint16Array);
      DataView.prototype.getInt16 = makeGetter(exports.Int16Array);
      DataView.prototype.getUint32 = makeGetter(exports.Uint32Array);
      DataView.prototype.getInt32 = makeGetter(exports.Int32Array);
      DataView.prototype.getFloat32 = makeGetter(exports.Float32Array);
      DataView.prototype.getFloat64 = makeGetter(exports.Float64Array);
      function makeSetter(arrayType) {
        return function(byteOffset, value, littleEndian) {
          byteOffset = ECMAScript.ToUint32(byteOffset);
          if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
            throw new RangeError("Array index out of range");
          }
          var typeArray = new arrayType([value]), byteArray = new exports.Uint8Array(typeArray.buffer), bytes = [], i, byteView;
          for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
            bytes.push(r(byteArray, i));
          }
          if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
            bytes.reverse();
          }
          byteView = new exports.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT);
          byteView.set(bytes);
        };
      }
      DataView.prototype.setUint8 = makeSetter(exports.Uint8Array);
      DataView.prototype.setInt8 = makeSetter(exports.Int8Array);
      DataView.prototype.setUint16 = makeSetter(exports.Uint16Array);
      DataView.prototype.setInt16 = makeSetter(exports.Int16Array);
      DataView.prototype.setUint32 = makeSetter(exports.Uint32Array);
      DataView.prototype.setInt32 = makeSetter(exports.Int32Array);
      DataView.prototype.setFloat32 = makeSetter(exports.Float32Array);
      DataView.prototype.setFloat64 = makeSetter(exports.Float64Array);
      exports.DataView = exports.DataView || DataView;
    })();
  })(typedarray);
  return typedarray;
}
var concatStream;
var hasRequiredConcatStream;
function requireConcatStream() {
  if (hasRequiredConcatStream) return concatStream;
  hasRequiredConcatStream = 1;
  var Writable = requireReadable().Writable;
  var inherits = require$$2;
  var bufferFrom = requireBufferFrom();
  if (typeof Uint8Array === "undefined") {
    var U8 = requireTypedarray().Uint8Array;
  } else {
    var U8 = Uint8Array;
  }
  function ConcatStream(opts, cb) {
    if (!(this instanceof ConcatStream)) return new ConcatStream(opts, cb);
    if (typeof opts === "function") {
      cb = opts;
      opts = {};
    }
    if (!opts) opts = {};
    var encoding = opts.encoding;
    var shouldInferEncoding = false;
    if (!encoding) {
      shouldInferEncoding = true;
    } else {
      encoding = String(encoding).toLowerCase();
      if (encoding === "u8" || encoding === "uint8") {
        encoding = "uint8array";
      }
    }
    Writable.call(this, { objectMode: true });
    this.encoding = encoding;
    this.shouldInferEncoding = shouldInferEncoding;
    if (cb) this.on("finish", function() {
      cb(this.getBody());
    });
    this.body = [];
  }
  concatStream = ConcatStream;
  inherits(ConcatStream, Writable);
  ConcatStream.prototype._write = function(chunk, enc, next) {
    this.body.push(chunk);
    next();
  };
  ConcatStream.prototype.inferEncoding = function(buff) {
    var firstBuffer = buff === void 0 ? this.body[0] : buff;
    if (Buffer.isBuffer(firstBuffer)) return "buffer";
    if (typeof Uint8Array !== "undefined" && firstBuffer instanceof Uint8Array) return "uint8array";
    if (Array.isArray(firstBuffer)) return "array";
    if (typeof firstBuffer === "string") return "string";
    if (Object.prototype.toString.call(firstBuffer) === "[object Object]") return "object";
    return "buffer";
  };
  ConcatStream.prototype.getBody = function() {
    if (!this.encoding && this.body.length === 0) return [];
    if (this.shouldInferEncoding) this.encoding = this.inferEncoding();
    if (this.encoding === "array") return arrayConcat(this.body);
    if (this.encoding === "string") return stringConcat(this.body);
    if (this.encoding === "buffer") return bufferConcat(this.body);
    if (this.encoding === "uint8array") return u8Concat(this.body);
    return this.body;
  };
  function isArrayish(arr) {
    return /Array\]$/.test(Object.prototype.toString.call(arr));
  }
  function isBufferish(p) {
    return typeof p === "string" || isArrayish(p) || p && typeof p.subarray === "function";
  }
  function stringConcat(parts) {
    var strings = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (typeof p === "string") {
        strings.push(p);
      } else if (Buffer.isBuffer(p)) {
        strings.push(p);
      } else if (isBufferish(p)) {
        strings.push(bufferFrom(p));
      } else {
        strings.push(bufferFrom(String(p)));
      }
    }
    if (Buffer.isBuffer(parts[0])) {
      strings = Buffer.concat(strings);
      strings = strings.toString("utf8");
    } else {
      strings = strings.join("");
    }
    return strings;
  }
  function bufferConcat(parts) {
    var bufs = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (Buffer.isBuffer(p)) {
        bufs.push(p);
      } else if (isBufferish(p)) {
        bufs.push(bufferFrom(p));
      } else {
        bufs.push(bufferFrom(String(p)));
      }
    }
    return Buffer.concat(bufs);
  }
  function arrayConcat(parts) {
    var res = [];
    for (var i = 0; i < parts.length; i++) {
      res.push.apply(res, parts[i]);
    }
    return res;
  }
  function u8Concat(parts) {
    var len = 0;
    for (var i = 0; i < parts.length; i++) {
      if (typeof parts[i] === "string") {
        parts[i] = bufferFrom(parts[i]);
      }
      len += parts[i].length;
    }
    var u8 = new U8(len);
    for (var i = 0, offset = 0; i < parts.length; i++) {
      var part = parts[i];
      for (var j = 0; j < part.length; j++) {
        u8[offset++] = part[j];
      }
    }
    return u8;
  }
  return concatStream;
}
var memory;
var hasRequiredMemory;
function requireMemory() {
  if (hasRequiredMemory) return memory;
  hasRequiredMemory = 1;
  var concat = requireConcatStream();
  function MemoryStorage(opts) {
  }
  MemoryStorage.prototype._handleFile = function _handleFile(req, file, cb) {
    file.stream.pipe(concat({ encoding: "buffer" }, function(data) {
      cb(null, {
        buffer: data,
        size: data.length
      });
    }));
  };
  MemoryStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    delete file.buffer;
    cb(null);
  };
  memory = function(opts) {
    return new MemoryStorage();
  };
  return memory;
}
var hasRequiredMulter;
function requireMulter() {
  if (hasRequiredMulter) return multer$1.exports;
  hasRequiredMulter = 1;
  var makeMiddleware = requireMakeMiddleware();
  var diskStorage = requireDisk();
  var memoryStorage = requireMemory();
  var MulterError = requireMulterError();
  function allowAll(req, file, cb) {
    cb(null, true);
  }
  function Multer(options) {
    if (options.storage) {
      this.storage = options.storage;
    } else if (options.dest) {
      this.storage = diskStorage({ destination: options.dest });
    } else {
      this.storage = memoryStorage();
    }
    this.limits = options.limits;
    this.preservePath = options.preservePath;
    this.fileFilter = options.fileFilter || allowAll;
  }
  Multer.prototype._makeMiddleware = function(fields, fileStrategy) {
    function setup() {
      var fileFilter = this.fileFilter;
      var filesLeft = /* @__PURE__ */ Object.create(null);
      fields.forEach(function(field) {
        if (typeof field.maxCount === "number") {
          filesLeft[field.name] = field.maxCount;
        } else {
          filesLeft[field.name] = Infinity;
        }
      });
      function wrappedFileFilter(req, file, cb) {
        if ((filesLeft[file.fieldname] || 0) <= 0) {
          return cb(new MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
        }
        filesLeft[file.fieldname] -= 1;
        fileFilter(req, file, cb);
      }
      return {
        limits: this.limits,
        preservePath: this.preservePath,
        storage: this.storage,
        fileFilter: wrappedFileFilter,
        fileStrategy
      };
    }
    return makeMiddleware(setup.bind(this));
  };
  Multer.prototype.single = function(name) {
    return this._makeMiddleware([{ name, maxCount: 1 }], "VALUE");
  };
  Multer.prototype.array = function(name, maxCount) {
    return this._makeMiddleware([{ name, maxCount }], "ARRAY");
  };
  Multer.prototype.fields = function(fields) {
    return this._makeMiddleware(fields, "OBJECT");
  };
  Multer.prototype.none = function() {
    return this._makeMiddleware([], "NONE");
  };
  Multer.prototype.any = function() {
    function setup() {
      return {
        limits: this.limits,
        preservePath: this.preservePath,
        storage: this.storage,
        fileFilter: this.fileFilter,
        fileStrategy: "ARRAY"
      };
    }
    return makeMiddleware(setup.bind(this));
  };
  function multer2(options) {
    if (options === void 0) {
      return new Multer({});
    }
    if (typeof options === "object" && options !== null) {
      return new Multer(options);
    }
    throw new TypeError("Expected object for argument options");
  }
  multer$1.exports = multer2;
  multer$1.exports.diskStorage = diskStorage;
  multer$1.exports.memoryStorage = memoryStorage;
  multer$1.exports.MulterError = MulterError;
  return multer$1.exports;
}
var multerExports = requireMulter();
const multer = /* @__PURE__ */ getDefaultExportFromCjs(multerExports);
const __filename$5 = fileURLToPath(import.meta.url);
const __dirname$6 = path.dirname(__filename$5);
const router$6 = Router();
const dataFilePath$5 = path.join(__dirname$6, "../data/invoices.json");
const uploadsDir = path.join(__dirname$6, "../uploads/invoices");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage$1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `invoice-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload$1 = multer({
  storage: storage$1,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, JPG, PNG, DOC files are allowed."));
    }
  }
});
const readData$5 = () => {
  const data = fs.readFileSync(dataFilePath$5, "utf8");
  return JSON.parse(data);
};
const writeData$5 = (data) => {
  fs.writeFileSync(dataFilePath$5, JSON.stringify(data, null, 2), "utf8");
};
router$6.get("/", (req, res) => {
  try {
    const data = readData$5();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router$6.get("/:id", (req, res) => {
  try {
    const data = readData$5();
    const item = Array.isArray(data) ? data.find((i) => i.id === req.params.id) : data;
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router$6.post("/", (req, res) => {
  try {
    const data = readData$5();
    if (Array.isArray(data)) {
      const newItem = {
        id: `INV-${Date.now()}`,
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        ...req.body
      };
      data.push(newItem);
      writeData$5(data);
      res.status(201).json(newItem);
    } else {
      res.status(400).json({ message: "Invalid data format" });
    }
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Error creating data" });
  }
});
router$6.post("/upload", upload$1.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileInfo = {
      id: `UPLOAD-${Date.now()}`,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadDate: (/* @__PURE__ */ new Date()).toISOString()
    };
    const data = readData$5();
    if (Array.isArray(data)) {
      const invoiceIndex = data.findIndex((invoice) => invoice.id === req.body.invoiceId);
      if (invoiceIndex !== -1) {
        data[invoiceIndex].attachedFile = fileInfo;
      } else {
        const newInvoice = {
          id: `INV-${Date.now()}`,
          date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          customer: req.body.customer || "Unknown",
          amount: req.body.amount || 0,
          status: "uploaded",
          attachedFile: fileInfo,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        data.push(newInvoice);
      }
      writeData$5(data);
    }
    res.json({
      message: "File uploaded successfully",
      file: fileInfo
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
});
router$6.get("/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Error downloading file" });
  }
});
router$6.put("/:id", (req, res) => {
  try {
    let data = readData$5();
    if (Array.isArray(data)) {
      const index = data.findIndex((i) => i.id === req.params.id);
      if (index !== -1) {
        data[index] = { ...data[index], ...req.body };
        writeData$5(data);
        res.json(data[index]);
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      data = { ...data, ...req.body };
      writeData$5(data);
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating item" });
  }
});
router$6.delete("/:id", (req, res) => {
  try {
    let data = readData$5();
    if (Array.isArray(data)) {
      const index = data.findIndex((i) => i.id === req.params.id);
      if (index !== -1) {
        if (data[index].isDeleted) {
          data.splice(index, 1);
          writeData$5(data);
          return res.status(200).json({ message: "Invoice permanently deleted" });
        } else {
          data[index].isDeleted = true;
          data[index].deletedAt = (/* @__PURE__ */ new Date()).toISOString();
          writeData$5(data);
          return res.status(200).json({ message: "Invoice soft deleted" });
        }
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      res.status(400).json({ message: "Cannot delete from this endpoint" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting item" });
  }
});
const __filename$4 = fileURLToPath(import.meta.url);
const __dirname$5 = path.dirname(__filename$4);
const router$5 = Router();
const dataFilePath$4 = path.join(__dirname$5, "../data/customers.json");
const readData$4 = () => {
  const data = fs.readFileSync(dataFilePath$4, "utf8");
  return JSON.parse(data);
};
const writeData$4 = (data) => {
  fs.writeFileSync(dataFilePath$4, JSON.stringify(data, null, 2), "utf8");
};
router$5.get("/", (req, res) => {
  try {
    const data = readData$4();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router$5.get("/:id", (req, res) => {
  try {
    const data = readData$4();
    const item = Array.isArray(data) ? data.find((i) => i.id === req.params.id) : data;
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router$5.post("/", (req, res) => {
  try {
    const data = readData$4();
    if (Array.isArray(data)) {
      const newItem = { id: `${req.originalUrl.split("/")[2].toUpperCase().slice(0, 3)}-${Date.now()}`, ...req.body };
      data.push(newItem);
      writeData$4(data);
      res.status(201).json(newItem);
    } else {
      res.status(400).json({ message: "Cannot create item for this endpoint" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating item" });
  }
});
router$5.put("/:id", (req, res) => {
  try {
    let data = readData$4();
    if (Array.isArray(data)) {
      const index = data.findIndex((i) => i.id === req.params.id);
      if (index !== -1) {
        data[index] = { ...data[index], ...req.body };
        writeData$4(data);
        res.json(data[index]);
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      data = { ...data, ...req.body };
      writeData$4(data);
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating item" });
  }
});
router$5.delete("/:id", (req, res) => {
  try {
    let data = readData$4();
    if (Array.isArray(data)) {
      const index = data.findIndex((i) => i.id === req.params.id);
      if (index !== -1) {
        data[index].isDeleted = true;
        writeData$4(data);
        res.status(200).json({ message: "Customer soft deleted" });
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      res.status(400).json({ message: "Cannot delete from this endpoint" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting item" });
  }
});
const router$4 = express.Router();
const inventoryDataPath = path__default.join(__dirname, "../data/inventory.json");
const stockMovementsPath = path__default.join(__dirname, "../data/stock_movements.json");
const readJsonFile = (filePath) => {
  try {
    const data = fs__default.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};
const writeJsonFile = (filePath, data) => {
  try {
    fs__default.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};
router$4.get("/", (req, res) => {
  try {
    const inventory = readJsonFile(inventoryDataPath);
    res.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});
router$4.get("/:id", (req, res) => {
  try {
    const inventory = readJsonFile(inventoryDataPath);
    const item = inventory.find((item2) => item2.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({ error: "Failed to fetch inventory item" });
  }
});
router$4.post("/", (req, res) => {
  try {
    const inventory = readJsonFile(inventoryDataPath);
    const newItem = {
      id: `INV-${Date.now()}`,
      ...req.body,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    inventory.push(newItem);
    if (writeJsonFile(inventoryDataPath, inventory)) {
      res.status(201).json(newItem);
    } else {
      res.status(500).json({ error: "Failed to save inventory item" });
    }
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({ error: "Failed to create inventory item" });
  }
});
router$4.put("/:id", (req, res) => {
  try {
    const inventory = readJsonFile(inventoryDataPath);
    const index = inventory.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    inventory[index] = {
      ...inventory[index],
      ...req.body,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (writeJsonFile(inventoryDataPath, inventory)) {
      res.json(inventory[index]);
    } else {
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  } catch (error) {
    console.error("Error updating inventory item:", error);
    res.status(500).json({ error: "Failed to update inventory item" });
  }
});
router$4.delete("/:id", (req, res) => {
  try {
    const inventory = readJsonFile(inventoryDataPath);
    const index = inventory.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    inventory[index].isDeleted = true;
    if (writeJsonFile(inventoryDataPath, inventory)) {
      res.json({ message: "Inventory item soft deleted" });
    } else {
      res.status(500).json({ error: "Failed to soft delete inventory item" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to soft delete inventory item" });
  }
});
router$4.get("/movements/all", (req, res) => {
  try {
    const movements = readJsonFile(stockMovementsPath);
    res.json(movements);
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    res.status(500).json({ error: "Failed to fetch stock movements" });
  }
});
router$4.get("/movements/:itemId", (req, res) => {
  try {
    const movements = readJsonFile(stockMovementsPath);
    const itemMovements = movements.filter((movement) => movement.itemId === req.params.itemId);
    res.json(itemMovements);
  } catch (error) {
    console.error("Error fetching item movements:", error);
    res.status(500).json({ error: "Failed to fetch item movements" });
  }
});
router$4.post("/movements", (req, res) => {
  try {
    const movements = readJsonFile(stockMovementsPath);
    const newMovement = {
      id: `MOV-${Date.now()}`,
      ...req.body,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    movements.push(newMovement);
    if (writeJsonFile(stockMovementsPath, movements)) {
      res.status(201).json(newMovement);
    } else {
      res.status(500).json({ error: "Failed to save stock movement" });
    }
  } catch (error) {
    console.error("Error creating stock movement:", error);
    res.status(500).json({ error: "Failed to create stock movement" });
  }
});
router$4.post("/:id/movement", (req, res) => {
  try {
    const { operation, quantity, notes, date, user } = req.body;
    if (!operation || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid operation or quantity" });
    }
    const inventory = readJsonFile(inventoryDataPath);
    const itemIndex = inventory.findIndex((item2) => item2.id === req.params.id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Inventory item not found" });
    }
    const item = inventory[itemIndex];
    const previousQuantity = item.quantity;
    let newQuantity;
    if (operation === "in") {
      newQuantity = previousQuantity + quantity;
    } else if (operation === "out") {
      if (quantity > previousQuantity) {
        return res.status(400).json({ error: "Insufficient stock" });
      }
      newQuantity = previousQuantity - quantity;
    } else {
      return res.status(400).json({ error: "Invalid operation" });
    }
    inventory[itemIndex] = {
      ...item,
      quantity: newQuantity,
      lastRestocked: operation === "in" ? date : item.lastRestocked,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const movements = readJsonFile(stockMovementsPath);
    const newMovement = {
      id: `MOV-${Date.now()}`,
      itemId: req.params.id,
      type: item.type,
      color: item.color,
      quantity,
      operation,
      user: user || "admin",
      date: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      notes: notes || "",
      previousQuantity,
      newQuantity,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    movements.push(newMovement);
    if (writeJsonFile(inventoryDataPath, inventory) && writeJsonFile(stockMovementsPath, movements)) {
      res.json({
        item: inventory[itemIndex],
        movement: newMovement
      });
    } else {
      res.status(500).json({ error: "Failed to update inventory and record movement" });
    }
  } catch (error) {
    console.error("Error processing stock movement:", error);
    res.status(500).json({ error: "Failed to process stock movement" });
  }
});
const __filename$3 = fileURLToPath(import.meta.url);
const __dirname$4 = path.dirname(__filename$3);
const router$3 = Router();
const dataFilePath$3 = path.join(__dirname$4, "../data/employees.json");
const readData$3 = () => {
  const data = fs.readFileSync(dataFilePath$3, "utf8");
  return JSON.parse(data);
};
const writeData$3 = (data) => {
  fs.writeFileSync(dataFilePath$3, JSON.stringify(data, null, 2), "utf8");
};
router$3.get("/", (req, res) => {
  try {
    const data = readData$3();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router$3.get("/:id", (req, res) => {
  try {
    const data = readData$3();
    const item = Array.isArray(data) ? data.find((i) => i.id === req.params.id) : data;
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router$3.post("/", (req, res) => {
  try {
    const data = readData$3();
    if (Array.isArray(data)) {
      const newItem = { id: `${req.originalUrl.split("/")[2].toUpperCase().slice(0, 3)}-${Date.now()}`, ...req.body };
      data.push(newItem);
      writeData$3(data);
      res.status(201).json(newItem);
    } else {
      res.status(400).json({ message: "Cannot create item for this endpoint" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating item" });
  }
});
router$3.put("/:id", (req, res) => {
  try {
    let data = readData$3();
    if (Array.isArray(data)) {
      const index = data.findIndex((i) => i.id === req.params.id);
      if (index !== -1) {
        data[index] = { ...data[index], ...req.body };
        writeData$3(data);
        res.json(data[index]);
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      data = { ...data, ...req.body };
      writeData$3(data);
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating item" });
  }
});
router$3.delete("/:id", (req, res) => {
  try {
    let data = readData$3();
    if (Array.isArray(data)) {
      const index = data.findIndex((i) => i.id === req.params.id);
      if (index !== -1) {
        data[index].isDeleted = true;
        writeData$3(data);
        res.status(200).json({ message: "Employee soft deleted" });
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      res.status(400).json({ message: "Cannot delete from this endpoint" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting item" });
  }
});
const __filename$2 = fileURLToPath(import.meta.url);
const __dirname$3 = path.dirname(__filename$2);
const router$2 = Router();
const dataFilePath$2 = path.join(__dirname$3, "../data/notifications.json");
const readData$2 = () => {
  const data = fs.readFileSync(dataFilePath$2, "utf8");
  return JSON.parse(data);
};
const writeData$2 = (data) => {
  fs.writeFileSync(dataFilePath$2, JSON.stringify(data, null, 2), "utf8");
};
router$2.get("/", (req, res) => {
  try {
    const data = readData$2();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router$2.get("/:id", (req, res) => {
  try {
    const data = readData$2();
    const item = Array.isArray(data) ? data.find((i) => i.id === req.params.id) : data;
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router$2.post("/", (req, res) => {
  try {
    const data = readData$2();
    if (Array.isArray(data)) {
      const newItem = {
        id: req.body.id || `NOTIF-${Date.now()}`,
        timestamp: req.body.timestamp || (/* @__PURE__ */ new Date()).toISOString(),
        read: req.body.read || false,
        ...req.body
      };
      data.push(newItem);
      writeData$2(data);
      res.status(201).json(newItem);
    } else {
      res.status(400).json({ message: "Cannot create item for this endpoint" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating item" });
  }
});
router$2.put("/:id", (req, res) => {
  try {
    let data = readData$2();
    if (Array.isArray(data)) {
      const index = data.findIndex((i) => i.id === req.params.id);
      if (index !== -1) {
        data[index] = { ...data[index], ...req.body };
        writeData$2(data);
        res.json(data[index]);
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      data = { ...data, ...req.body };
      writeData$2(data);
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating item" });
  }
});
router$2.delete("/:id", (req, res) => {
  try {
    let data = readData$2();
    if (Array.isArray(data)) {
      const initialLength = data.length;
      data = data.filter((i) => i.id !== req.params.id);
      if (data.length < initialLength) {
        writeData$2(data);
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      res.status(400).json({ message: "Cannot delete from this endpoint" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting item" });
  }
});
router$2.patch("/:id/read", (req, res) => {
  try {
    let data = readData$2();
    if (Array.isArray(data)) {
      const index = data.findIndex((i) => i.id === req.params.id);
      if (index !== -1) {
        data[index] = { ...data[index], read: true };
        writeData$2(data);
        res.json(data[index]);
      } else {
        res.status(404).json({ message: "Notification not found" });
      }
    } else {
      res.status(400).json({ message: "Cannot mark as read" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read" });
  }
});
router$2.patch("/read-all", (req, res) => {
  try {
    let data = readData$2();
    if (Array.isArray(data)) {
      data = data.map((notification) => ({ ...notification, read: true }));
      writeData$2(data);
      res.json({ message: "All notifications marked as read" });
    } else {
      res.status(400).json({ message: "Cannot mark all as read" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error marking all notifications as read" });
  }
});
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$2 = path.dirname(__filename$1);
const router$1 = Router();
const dataFilePath$1 = path.join(__dirname$2, "../data/financials.json");
const readData$1 = () => {
  const data = fs.readFileSync(dataFilePath$1, "utf8");
  return JSON.parse(data);
};
const writeData$1 = (data) => {
  fs.writeFileSync(dataFilePath$1, JSON.stringify(data, null, 2), "utf8");
};
router$1.get("/", (req, res) => {
  try {
    const data = readData$1();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router$1.get("/:id", (req, res) => {
  try {
    const data = readData$1();
    const item = Array.isArray(data) ? data.find((i) => i.id === req.params.id) : data;
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router$1.post("/", (req, res) => {
  try {
    const data = readData$1();
    if (Array.isArray(data)) {
      const newItem = { id: `${req.originalUrl.split("/")[2].toUpperCase().slice(0, 3)}-${Date.now()}`, ...req.body };
      data.push(newItem);
      writeData$1(data);
      res.status(201).json(newItem);
    } else {
      res.status(400).json({ message: "Cannot create item for this endpoint" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating item" });
  }
});
router$1.put("/:id", (req, res) => {
  try {
    let data = readData$1();
    if (Array.isArray(data)) {
      const index = data.findIndex((i) => i.id === req.params.id);
      if (index !== -1) {
        data[index] = { ...data[index], ...req.body };
        writeData$1(data);
        res.json(data[index]);
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      data = { ...data, ...req.body };
      writeData$1(data);
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating item" });
  }
});
router$1.delete("/:id", (req, res) => {
  try {
    let data = readData$1();
    if (Array.isArray(data)) {
      const initialLength = data.length;
      data = data.filter((i) => i.id !== req.params.id);
      if (data.length < initialLength) {
        writeData$1(data);
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      res.status(400).json({ message: "Cannot delete from this endpoint" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting item" });
  }
});
const __filename = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename);
const router = Router();
const dataFilePath = path.join(__dirname$1, "../data/suppliers.json");
const readData = () => {
  const data = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(data);
};
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
};
const supplierInvoicesDir = path.join(__dirname$1, "../uploads/supplier-invoices");
if (!fs.existsSync(supplierInvoicesDir)) {
  fs.mkdirSync(supplierInvoicesDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, supplierInvoicesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `supplier-invoice-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, JPG, PNG files are allowed."));
    }
  }
});
router.get("/", (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router.get("/:id", (req, res) => {
  try {
    const data = readData();
    const item = Array.isArray(data) ? data.find((i) => i.id === req.params.id) : data;
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error reading data" });
  }
});
router.post("/", (req, res) => {
  try {
    const data = readData();
    if (Array.isArray(data)) {
      const newItem = { id: `${req.originalUrl.split("/")[2].toUpperCase().slice(0, 3)}-${Date.now()}`, ...req.body };
      data.push(newItem);
      writeData(data);
      res.status(201).json(newItem);
    } else {
      res.status(400).json({ message: "Cannot create item for this endpoint" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating item" });
  }
});
router.put("/:id", (req, res) => {
  try {
    let data = readData();
    if (Array.isArray(data)) {
      const index = data.findIndex((i) => i.id === req.params.id);
      if (index !== -1) {
        data[index] = { ...data[index], ...req.body };
        writeData(data);
        res.json(data[index]);
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      data = { ...data, ...req.body };
      writeData(data);
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating item" });
  }
});
router.delete("/:id", (req, res) => {
  try {
    let data = readData();
    if (Array.isArray(data)) {
      const index = data.findIndex((i) => i.id === req.params.id);
      if (index !== -1) {
        data[index].isDeleted = true;
        writeData(data);
        res.status(200).json({ message: "Supplier soft deleted" });
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } else {
      res.status(400).json({ message: "Cannot delete from this endpoint" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting item" });
  }
});
router.get("/:id/invoices", (req, res) => {
  try {
    const data = readData();
    const supplier = Array.isArray(data) ? data.find((i) => i.id === req.params.id) : null;
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier.invoices || []);
  } catch (error) {
    res.status(500).json({ message: "Error reading supplier invoices" });
  }
});
router.post("/:id/invoices", upload.single("file"), (req, res) => {
  try {
    const data = readData();
    const supplierIndex = Array.isArray(data) ? data.findIndex((i) => i.id === req.params.id) : -1;
    if (supplierIndex === -1) return res.status(404).json({ message: "Supplier not found" });
    const { date, quantity, notes } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    const invoice = {
      id: `SUPINV-${Date.now()}`,
      date,
      quantity,
      notes,
      file: {
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadDate: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
    if (!data[supplierIndex].invoices) data[supplierIndex].invoices = [];
    data[supplierIndex].invoices.push(invoice);
    writeData(data);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: "Error saving supplier invoice" });
  }
});
router.put("/:id/invoices/:invoiceId", (req, res) => {
  try {
    const data = readData();
    const supplierIndex = Array.isArray(data) ? data.findIndex((i) => i.id === req.params.id) : -1;
    if (supplierIndex === -1) return res.status(404).json({ message: "Supplier not found" });
    const invoices = data[supplierIndex].invoices || [];
    const invoiceIndex = invoices.findIndex((inv) => inv.id === req.params.invoiceId);
    if (invoiceIndex === -1) return res.status(404).json({ message: "Invoice not found" });
    invoices[invoiceIndex] = { ...invoices[invoiceIndex], ...req.body };
    data[supplierIndex].invoices = invoices;
    writeData(data);
    res.json(invoices[invoiceIndex]);
  } catch (error) {
    res.status(500).json({ message: "Error updating supplier invoice" });
  }
});
router.get("/:id/invoices/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(supplierInvoicesDir, filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error downloading file" });
  }
});
function createServer() {
  const app = express();
  app.use(express.static(path__default.join(process.cwd(), "client/public")));
  app.use(cors({
    origin: ["http://localhost:8080", "http://localhost:8081", "http://localhost:8082", "http://localhost:8083", "http://localhost:8084", "http://192.168.1.111:8080", "http://192.168.1.111:8081", "http://192.168.1.111:8082", "http://192.168.1.111:8083", "http://192.168.1.111:8084"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"]
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      server: "Express server v2"
    });
  });
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });
  app.get("/api/demo", handleDemo);
  app.use("/api/orders", router$7);
  app.use("/api/invoices", router$6);
  app.use("/api/customers", router$5);
  app.use("/api/inventory", router$4);
  app.use("/api/employees", router$3);
  app.use("/api/notifications", router$2);
  app.use("/api/financials", router$1);
  app.use("/api/suppliers", router);
  return app;
}
export {
  createServer
};
//# sourceMappingURL=index.mjs.map
