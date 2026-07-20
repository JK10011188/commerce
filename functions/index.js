
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { getNoti, getNoticeTypeString } = require("./product-noti-util");

admin.initializeApp({
  storageBucket: "gs://commerse-interface.appspot.com",
  // storageBucket: "gs://project52-4722c.firebasestorage.app",
});


const db = admin.firestore();
const storage = admin.storage();
const app = express();

// CORS
// app.use(cors());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// ##### 공통 함수, API #####
// IP 허용 설정
const allowedIPs = ["58.232.89.143", "210.220.163.82", "61.99.227.47"];
app.set("trust proxy", true);
// app.use((req, res, next) => {
//   const clientIP = req.ip;
//   console.log("Client IP:", clientIP);
//   if (!allowedIPs.includes(clientIP)) {
//     return res
//       .status(403)
//       .send(`Access Denied: Your IP ${clientIP} is not allowed`);
//   }

//   next();
// });

// 카테고리별 키워드 태그 저장 함수
async function saveKeywords(categoryCode, keywords) {

  if (!Array.isArray(keywords)) {
    keywords = [keywords];
  }

  try {
    const categoryRef = db.collection("Keywords").doc(String(categoryCode));
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      await categoryRef.set({});
    }

    const keywordString = keywords.join(",");
    await categoryRef.update({ Keywords: keywordString });

    console.log("Keywords saved successfully");
  } catch (error) {
    console.error("Error saving keywords:", error);
    throw error;
  }
}

// 카테고리별 키워드 태그 조회 함수
async function getKeywords(categoryCode) {
  console.log("Retrieving keywords");
  console.log("Category code:", categoryCode);

  try {
    const categoryRef = db.collection("Keywords").doc(String(categoryCode));
    const categoryDoc = await categoryRef.get();

    if (categoryDoc.exists) {
      const data = categoryDoc.data();
      const keywords = data.Keywords;

      console.log("Retrieved keywords:", keywords);
      return keywords;
    } else {
      console.log("No keywords found for the category");
      return [];
    }
  } catch (error) {
    console.error("Error retrieving keywords:", error);
    throw error;
  }
}

// 카테고리별 키워드 태그 조회 API
app.post("/getKeywords", async (req, res) => {
  console.log("getKeywords API called");

  const categoryCode = req.body.categoryCode;

  try {
    const keywords = await getKeywords(categoryCode);

    res.json({
      result: "success",
      message: "Keywords retrieved successfully",
      keywords: keywords,
    });
  } catch (error) {
    console.error("Error retrieving keywords:", error);

    res.status(500).json({
      result: "error",
      message: "Failed to retrieve keywords",
    });
  }
});

// 계정 목록 조회 API
app.get("/searchAccounts", async (req, res) => {
  console.log("ACC 데이터 로딩");

  // IP 테스트
  const https = require("https");

  https
    .get("https://checkip.amazonaws.com", (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const ipAddress = data.trim();
        console.log("외부 IP 주소:", ipAddress);
      });
    })
    .on("error", (error) => {
      console.error("IP 주소 확인 실패:", error);
    });

  let accDatas = [];
  // firestore에서 Accounts > 계정 목록 조회 > accDatas에 저장
  db.collection("Accounts")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        // console.log(doc.data());
        const data = doc.data();
        let accData = {
          accName: doc.id,
          cp_id: data.cp_id,
          cp_code: data.cp_code,
          cp_ak: data.cp_ak,
          cp_sk: data.cp_sk,
          n_id: data.n_id,
          n_sk: data.n_sk,
        };
        accDatas.push(accData);
      });
      console.log("ACC 데이터 로딩 성공");

      // 응답 json
      let resJson = {
        result: "success",
        message: "ACC 데이터 로딩 성공",
        accounts: accDatas,
      };

      res.json(resJson);
    })
    .catch((err) => {
      console.error("Error getting documents", err);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 로딩 실패",
      });
    });
});

// ##### 설정 API #####
// 계정 추가 API
app.post("/addAccount", async (req, res) => {
  console.log("ACC 데이터 추가");

  // Firestore에 문서 데이터 추가.
  db.collection("Accounts")
    .doc(req.body.accName)
    .set({
      cp_id: req.body.cp_id,
      cp_code: req.body.cp_code,
      cp_ak: req.body.cp_ak,
      cp_sk: req.body.cp_sk,
      n_id: req.body.n_id,
      n_sk: req.body.n_sk,
    })
    .then(() => {
      console.log("ACC 데이터 추가 성공");

      // 응답 json
      res.json({
        result: "success",
        message: "ACC 데이터 추가 성공",
      });
    })
    .catch((error) => {
      console.error("Error writing document: ", error);

      res.status(500).json({
        result: "error",
        message: "ACC 데이터 추가 실패",
      });
    });
});

// 계정 수정 API
app.put("/updateAccount", async (req, res) => {
    const accName = req.body.accName;
  
    db.collection("Accounts")
      .doc(accName)
      .update({
        cp_id: req.body.cp_id,
        cp_code: req.body.cp_code,
        cp_ak: req.body.cp_ak,
        cp_sk: req.body.cp_sk,
        n_id: req.body.n_id,
        n_sk: req.body.n_sk,
      })
      .then(() => {
  
        res.json({
          result: "success",
          message: "ACC 데이터 수정 성공",
        });
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
        res.status(500).json({
          result: "error",
          message: "ACC 데이터 수정 실패",
        });
      });
  });

// 계정 삭제 API
app.delete("/deleteAccount", async (req, res) => {
  const accName = req.query.accName;
  db.collection("Accounts")
    .doc(accName)
    .delete()
    .then(() => {
      res.json({
        result: "success",
        message: "ACC 데이터 삭제 성공",
      });
    })
    .catch((error) => {
      console.error("Error deleting document: ", error);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 삭제 실패",
      });
    });
});

// ##### 쿠팡 API #####

// 쿠팡 상품목록 조회 API
app.post("/CPsearchProd", async (req, res) => {
  console.log("쿠팡 상품목록 조회");

  // 계정명 Firestore Key 조회
  let accData;
  await db
    .collection("Accounts")
    .doc(req.body.accName)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        res.status(404).json({
          result: "error",
          message: "ACC 데이터 조회 실패",
        });
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 조회 실패",
      });
    });

  const cp_code = accData.cp_code; // 셀러 ID
  const cp_ak = accData.cp_ak; // Access Key
  const cp_sk = accData.cp_sk; // Secret Key

  // 요청 파라미터 설정
  const datetime =
    new Date()
      .toISOString()
      .substr(2, 17)
      .replace(/:/gi, "")
      .replace(/-/gi, "") + "Z";
  const method = "GET";
  const path =
    "/v2/providers/seller_api/apis/api/v1/marketplace/seller-products";
  let page = 1;
  let nextToken = 1;

  const queryParams = {
    vendorId: cp_code,
    maxPerPage: req.body.maxPerPage || 50,
  };

  if (req.body.prodname) {
    queryParams.sellerProductName = req.body.prodname;
  }

  if (req.body.prodnum) {
    queryParams.sellerProductId = req.body.prodnum;
  }

  if (req.body.page) {
    queryParams.nextToken = 1;
    page = req.body.page;
  }

  console.log("상품목록 조회 함수 호출");

  getProductsList_Coupang(
    page,
    nextToken,
    queryParams,
    path,
    method,
    cp_sk,
    cp_ak,
    datetime
  )
    .then(({ nextToken, data }) => {
      // console.log("nextToken: ", nextToken);
      // console.log("data: ", data.data);
      // 응답 json
      res.json({
        result: "success",
        message: "CP 상품목록 조회 성공",
        nextToken : nextToken,
        data: data,
      });
    })
    .catch((error) => {
      console.error("CP 상품목록 조회 실패", error);
      console.log(error);

      res.status(500).json({
        result: "error",
        message: "CP 상품목록 조회 실패",
        error: error,
      });
    });
});

const https = require("https");
const crypto = require("crypto");
const { CLIENT_RENEG_LIMIT } = require("tls");

// 쿠팡 상품목록 조회 API 함수
async function getProductsList_Coupang(
  page,
  nextToken,
  queryParams,
  path,
  method,
  cp_sk,
  cp_ak,
  datetime
) {
  let result = {};

  // 페이지 수 만큼 반복
  console.log(`요청 페이지 수: ${page}`);
  for (let i = 1; i <= page; i++) {
    if (nextToken === "") {
      break;
    }

    console.log(`현재 조회 페이지: ${i}`);

    queryParams.nextToken = nextToken;
    const searchParams = new URLSearchParams(queryParams);
    const query = new URLSearchParams(queryParams).toString();
    console.log(`쿼리: ${query.split("&")}`);
    const message = datetime + method + path + searchParams.toString();

    // HMAC 서명 생성
    const algorithm = "sha256";
    const signature = crypto
      .createHmac(algorithm, cp_sk)
      .update(message)
      .digest("hex");
    const authorization = `CEA algorithm=HmacSHA256, access-key=${cp_ak}, signed-date=${datetime}, signature=${signature}`;

    // API 옵션 설정
    const options = {
      hostname: "api-gateway.coupang.com",
      port: 443,
      path: `${path}?${query}`,
      method: method,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: authorization,
        "X-EXTENDED-TIMEOUT": 90000,
      },
    };

    // 상품목록 조회 API 요청 전송
    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        console.log("상품목록 조회 API 요청 전송");

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsedData = JSON.parse(data);

            // console.log(`data: ${JSON.stringify(parsedData, null, 2)}`);
            const productIdList = parsedData.data.map(
              (item) => item.sellerProductId
            );
            // data, token 반환
            nextToken = parsedData.nextToken;
            result = { nextToken: nextToken, data: parsedData.data };

            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on("error", (error) => {
        console.error(`problem with request: ${error.message}`);
        reject(error);
      });

      req.end();
    });
  }

  // 조회결과 상품별 추가 정보 API 요청
  const additionalInfoPromises = result.data.map(async (item) => {
    try {
      const data = await getSellerProduct(item.sellerProductId, cp_ak, cp_sk);
      item.salePrice = data.data.items[0].salePrice; // 할인가
      item.deliveryCharge = data.data.deliveryCharge; // 택배비
      // console.log(data.data);
    } catch (error) {
      console.error(
        `Error fetching additional info for item ${item.sellerProductId}:`,
        error
      );
    }
    return item;
  });

  result.data = await Promise.all(additionalInfoPromises);
  return result;
}

// 쿠팡 상품 상세 조회 함수
// 429 Too many Requests 발생시 재시도 로직 포함
async function getSellerProduct(sellerProductId, cp_ak, cp_sk, retryCount = 0) {
  const method = "GET";
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}`;
  const datetime =
    new Date()
      .toISOString()
      .substr(2, 17)
      .replace(/:/gi, "")
      .replace(/-/gi, "") + "Z";

  // HMAC 서명 생성
  const message = datetime + method + path;
  const algorithm = "sha256";
  const signature = crypto
    .createHmac(algorithm, cp_sk)
    .update(message)
    .digest("hex");

  const authorization = `CEA algorithm=HmacSHA256, access-key=${cp_ak}, signed-date=${datetime}, signature=${signature}`;

  const options = {
    hostname: "api-gateway.coupang.com",
    port: 443,
    path: path,
    method: method,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: authorization,
      // "X-EXTENDED-TIMEOUT": 90000,
    },
  };

  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          console.log(res.statusCode);
          if (res.statusCode === 429 && retryCount < 3) {
            // 429 응답이 왔고 재시도 횟수가 3회 미만인 경우
            reject(new Error("Retry"));
          } else {
            resolve({ statusCode: res.statusCode, data: data });
          }
        });
      });

      req.on("error", (error) => {
        console.error(error);
        reject(error);
      });

      req.end();
    });

    if (response.statusCode === 200) {
      const jsonData = JSON.parse(response.data.trim());
      return jsonData;
    } else {
      throw new Error(`Unexpected status code: ${response.statusCode}`);
    }
  } catch (error) {
    if (error.message === "Retry" && retryCount < 3) {
      // 재시도 로직
      const delay = Math.pow(2, retryCount) * 1000; // 지수 백오프 지연 시간
      console.log(`Retrying ${sellerProductId} in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return getSellerProduct(sellerProductId, cp_ak, cp_sk, retryCount + 1);
    } else {
      console.error("Response data:", error);
      throw error;
    }
  }
}

// 쿠팡 판매가 수정 API
app.use("/CPmodifyProducts", async (req, res) => {
  console.log("쿠팡 판매가 수정");
  console.log(req.body);

  // 계정 API Key 조회
  let accData;
  await db
    .collection("Accounts")
    .doc(req.body.accName)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        res.status(404).json({
          result: "error",
          message: "ACC 데이터 조회 실패",
        });
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 조회 실패",
      });
    });

  const cp_code = accData.cp_code; // 셀러 ID
  const cp_ak = accData.cp_ak; // Access Key
  const cp_sk = accData.cp_sk; // Secret Key

  console.log(req.body.selectedProducts);

  // 상품 데이터 루프
  for (const product of req.body.selectedProducts) {
    const productId = product.productId;
    const salePrice = product.salePrice;

    // 상품 상세조회 함수 호출 => 옵션번호 조회
    const productData = await getSellerProduct(productId, cp_ak, cp_sk);
    let vendorItemId = productData.data.items[0].vendorItemId;
    console.log("판매가 수정 옵션번호:", productId);

    // 가격 변경 API 호출

    // HMAC 인증 서명 생성
    // 가격범위 해제 쿼리 포함시 시그니처 오류 발생
    const method = "PUT";
    const path = `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${vendorItemId}/prices/${salePrice}`;
    console.log(path);

    const datetime =
      new Date()
        .toISOString()
        .substr(2, 17)
        .replace(/:/gi, "")
        .replace(/-/gi, "") + "Z";

    const message = datetime + method + path;
    const algorithm = "sha256";
    const signature = crypto
      .createHmac(algorithm, cp_sk)
      .update(message)
      .digest("hex");

    const authorization = `CEA algorithm=HmacSHA256, access-key=${cp_ak}, signed-date=${datetime}, signature=${signature}`;
    console.log(authorization);

    const options = {
      method: method,
      hostname: "api-gateway.coupang.com",
      path: path,
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
    };

    const updatePricePromise = new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          console.log("가격 변경 API 응답:", data);
          const response = JSON.parse(data);
          if (response.code === "ERROR") {
            console.error("상품 수정 API 오류:", response.messages.korean);
            reject(new Error(response.message));
          } else {
            resolve(response);
          }

          resolve(JSON.parse(data));
        });
      });

      req.on("error", (error) => {
        console.error("가격 변경 API 오류:", error);
        reject(error);
      });

      req.end();
    });

    try {
      const updatePriceResult = await updatePricePromise;
      console.log("가격 변경 성공:", updatePriceResult);
      res.status(200).json({ message: "가격 변경 성공: ", updatePriceResult });
    } catch (error) {
      console.error("가격 변경 실패:", error);
      res.status(500).send(`가격 변경 실패: ${error}`);
      throw new Error("가격 변경 중 오류가 발생했습니다.");
    }
  }
});

app.post("/CPuploadImg", async (req, res) => {
  console.log("쿠팡 이미지 업로드");

  try {
    const { productId, imageType, images } = req.body;
    console.log("Product ID:", productId);
    console.log("Image Type:", imageType);
    console.log("Uploaded files:", images.length);

    if (!images.length) {
      return res.status(400).send("이미지 파일이 없습니다.");
    }

    // 계정 API Key 조회
    let accData;
    await db
      .collection("Accounts")
      .doc(req.body.accName)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          console.log("No such document!");
          res.status(404).json({
            result: "error",
            message: "ACC 데이터 조회 실패",
          });
        } else {
          accData = doc.data();
          console.log("계정명:", doc.id);
        }
      })
      .catch((err) => {
        console.log("Error getting document", err);
        res.status(500).json({
          result: "error",
          message: "ACC 데이터 조회 실패",
        });
      });

    const cp_code = accData.cp_code; // 셀러 ID
    const cp_ak = accData.cp_ak; // Access Key
    const cp_sk = accData.cp_sk; // Secret Key

    // 이미지 업로드 및 CDN URL 반환 프로미스
    const uploadPromises = images.map(async (imageData, index) => {
      if (!imageData) {
        console.warn(`${index}번째 이미지 데이터가 없습니다.`);
        return null;
      }

      const fileBuffer = Buffer.from(imageData, "base64");
      console.log(`File ${index} size:`, fileBuffer.length, "bytes");
      console.log(`File ${index} mimetype:`, "image/jpeg");

      // Storage에 이미지 업로드 및 CDN 경로
      const fileName = `images/${productId}/${imageType}/${index}.jpg`;
      const file = storage.bucket().file(fileName);
      await file.save(fileBuffer, {
        metadata: {
          contentType: "image/jpeg",
        },
      });

      // ** CDN URL 권한 **
      await file.acl.add({
        entity: "allUsers",
        role: "READER",
      });

      const [metadata] = await file.getMetadata();
      const cdnUrl = metadata.mediaLink;
      console.log(`File ${index} CDN URL:`, cdnUrl);

      return cdnUrl;
    });

    let cdnUrls = await Promise.all(uploadPromises);

    // 상품 상세조회 함수 호출
    const productData = await getSellerProduct(productId, cp_ak, cp_sk);
    console.log(productData.data.items[0].images);

    // JSON 데이터 수정
    if (imageType === "main") {
      console.log("메인 이미지 JSON 수정");

      console.log(
        "수정 전 데이터:",
        JSON.stringify(productData.data.items[0].images, null, 2)
      );

      productData.data.items[0].images = [];
      cdnUrls.forEach((url, index) => {
        const imageType = index === 0 ? "REPRESENTATION" : "DETAIL";
        const imageData = {
          imageOrder: index,
          imageType: imageType,
          vendorPath: url,
        };
        productData.data.items[0].images.push(imageData);
      });
      console.log(
        "수정된 데이터:",
        JSON.stringify(productData.data.items[0].images, null, 2)
      );
    } else if (imageType === "desc") {
      console.log("상세 이미지 JSON 수정");
      // console.log(JSON.stringify(productData.data.items[0].contents, null, 2));

      const newContents = [
        {
          contentsType: "IMAGE",
          contentDetails: cdnUrls.map((url) => ({
            content: url,
            detailType: "IMAGE",
          })),
        },
      ];
      console.log(JSON.stringify(newContents, null, 2));
      productData.data.items[0].contents = newContents;
    }

    // 상품 속성 값이 공백이면 exposed => NONE
    const updatedAttributes = productData.data.items[0].attributes.map(
      (attribute) => {
        if (attribute.attributeValueName === "") {
          return {
            ...attribute,
            exposed: "NONE",
          };
        }
        return attribute;
      }
    );
    productData.data.items[0].attributes = updatedAttributes;

    // 상품 수정 API 호출 프로미스
    const updateProductPromise = new Promise((resolve, reject) => {
      // HMAC 인증 서명 생성
      const method = "PUT";
      const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products`;
      const datetime =
        new Date()
          .toISOString()
          .substr(2, 17)
          .replace(/:/gi, "")
          .replace(/-/gi, "") + "Z";

      const message = datetime + method + path;
      const algorithm = "sha256";
      const signature = crypto
        .createHmac(algorithm, cp_sk)
        .update(message)
        .digest("hex");

      const authorization = `CEA algorithm=HmacSHA256, access-key=${cp_ak}, signed-date=${datetime}, signature=${signature}`;

      // 상품 수정 API 호출
      const options = {
        method: "PUT",
        hostname: "api-gateway.coupang.com",
        path: "/v2/providers/seller_api/apis/api/v1/marketplace/seller-products",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          console.log("상품 수정 API 응답:", data);
          const response = JSON.parse(data);
          if (response.code === "ERROR") {
            console.error("상품 수정 API 오류:", response.messages.korean);
            reject(new Error(response.message));
          } else {
            resolve(response);
          }
        });
      });

      req.on("error", (error) => {
        console.error("상품 수정 API 오류:", error);
        reject(error);
      });

      req.write(JSON.stringify(productData.data));
      req.end();
    });

    // 응답
    try {
      const updatedProduct = await updateProductPromise;
      res.status(200).json({ message: "상품 수정 성공: ", updatedProduct });
    } catch (error) {
      res.status(500).send(`상품 수정 실패: ${error}`);
    }
  } catch (error) {
    console.error("File upload failed:", error);
    res.status(500).send(`파일 업로드 실패 ${error}`);
  }
});

// 카테고리 조회
app.post("/CPsearchCategory", async (req, res) => {
  console.log("쿠팡 카테고리 조회");

  // 계정 API Key 조회
  let accData = req.body.accName;
  let displayCategoryCode = req.body.displayCategoryCode;

  if (accData == "") {
    res.status(400).json({
      result: "error",
      message: "ACC 데이터 조회 실패",
    });
  }

  await db
    .collection("Accounts")
    .doc(accData)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        res.status(404).json({
          result: "error",
          message: "ACC 데이터 조회 실패",
        });
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 조회 실패",
      });
    });

  const cp_code = accData.cp_code; // 셀러 ID
  const cp_ak = accData.cp_ak; // Access Key
  const cp_sk = accData.cp_sk; // Secret Key

  // 쿠팡 카테고리 조회 API
  const method = "GET";
  const path =
    '/v2/providers/seller_api/apis/api/v1/marketplace/meta/display-categories';
  const datetime =
    new Date()
      .toISOString()
      .substr(2, 17)
      .replace(/:/gi, "")
      .replace(/-/gi, "") + "Z";

  const message = datetime + method + path;
  const algorithm = "sha256";
  const signature = crypto
    .createHmac(algorithm, cp_sk)
    .update(message)
    .digest("hex");

  const authorization = `CEA algorithm=HmacSHA256, access-key=${cp_ak}, signed-date=${datetime}, signature=${signature}`;
  const url = `https://api-gateway.coupang.com${path}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
  });
  const data = await response.json();
  console.log("쿠팡 카테고리 조회 API 응답:", data);
  if (data.code === "ERROR") {
    console.error("쿠팡 카테고리 조회 API 오류:", data.messages.korean);
    res.status(500).json({
      result: "error",
      message: "쿠팡 카테고리 조회 API 오류",
    });
  } else {
    res.status(200).json({
      result: "success",
      message: "쿠팡 카테고리 조회 성공",
      data,
    });
  }  
});

// 쿠팡 상품 삭제
app.post("/CPdeleteProducts", async (req, res) => {
  console.log("쿠팡 상품 삭제");
  console.log(req.body);

  // const { accName, selectedProducts } = req.body;

  const accName = "사업1(네이버 62032, 쿠팡 fadcho)"
  const sellerProductId = req.body.sellerProductId;

  if (!accName) {
    res.status(400).json({
      result: "error",
      message: "필수 파라미터가 누락되었습니다.",
    });
    return;
  }

  try {
    // 계정 API Key 조회
    const accData = await db.collection("Accounts").doc(accName).get();

    if (!accData.exists) {
      res.status(404).json({
        result: "error",
        message: "ACC 데이터 조회 실패",
      });
      return;
    }

    const cp_code = accData.data().cp_code; // 셀러 ID
    const cp_ak = accData.data().cp_ak; // Access Key
    const cp_sk = accData.data().cp_sk; // Secret Key

    // 상품 삭제 요청 함수
    const deleteProduct = async (sellerProductId) => {
      const method = "DELETE";
      const path = `/v2/providers/seller_api/apis/api/v1/marketplace/seller-products/${sellerProductId}`;
      const datetime =
        new Date()
          .toISOString()
          .substr(2, 17)
          .replace(/:/gi, "")
          .replace(/-/gi, "") + "Z";
      const message = datetime + method + path;
      const algorithm = "sha256";
      const signature = crypto
        .createHmac(algorithm, cp_sk)
        .update(message)
        .digest("hex");
      const authorization = `CEA algorithm=HmacSHA256, access-key=${cp_ak}, signed-date=${datetime}, signature=${signature}`;

      const options = {
        method: method,
        hostname: "api-gateway.coupang.com",
        path: path,
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
      };

      return new Promise((resolve, reject) => {
        const apiReq = https.request(options, (apiRes) => {
          let data = "";
          apiRes.on("data", (chunk) => {
            data += chunk;
          });
          apiRes.on("end", () => {
            resolve(JSON.parse(data));
          });
        });

        apiReq.on("error", (error) => {
          reject(error);
        });

        apiReq.end();
      });
    };

    const response = await deleteProduct(sellerProductId);

    res.json({
      result: "success",
      message: "쿠팡 상품 삭제 성공",
    });
  } catch (error) {
    console.error("쿠팡 상품 삭제 에러:", error);
    res.status(500).json({
      result: "error",
      message: "쿠팡 상품 삭제 실패",
    });
  }
});

// 쿠팡 카테고리 메타 정보 조회
app.post("/CPsearchCategoryMeta", async (req, res) => {
  console.log("쿠팡 카테고리 메타 정보 조회");

  // 계정 API Key 조회
  let accData = req.body.accName;

  if (accData == undefined) {
    res.status(400).json({
      result: "error",
      message: "선택된계정 정보가 없습니다.",
    });
  }

  await db
    .collection("Accounts")
    .doc(accData)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        res.status(404).json({
          result: "error",
          message: "ACC 데이터 조회 실패",
        });
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 조회 실패",
      });
    });

  try {
    const lastCategoryKey = req.body.lastCategoryKey;
    const cp_ak = accData.cp_ak; // Access Key
    const cp_sk = accData.cp_sk; // Secret Key

    const categoryMeta = await getCategoryMeta(
      cp_ak,
      cp_sk,
      parseInt(lastCategoryKey)
    );

    res.json(categoryMeta);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 쿠팡 상품 등록
app.post("/CPAddProducts", async (req, res) => {
  console.log("쿠팡 상품 등록");

  // 계정 API Key 조회
  let accData = req.body.accName;

  if (accData == undefined) {
    res.status(400).json({
      result: "error",
      message: "선택된계정 정보가 없습니다.",
    });
  }

  await db
    .collection("Accounts")
    .doc(accData)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        res.status(404).json({
          result: "error",
          message: "ACC 데이터 조회 실패",
        });
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 조회 실패",
      });
    });

  try {
    const cp_code = accData.cp_code; // 셀러 ID
    const cp_id = accData.cp_id; // Secret Key
    const cp_ak = accData.cp_ak; // Access Key
    const cp_sk = accData.cp_sk; // Secret Key

    // console.log(req.body);

    const result = await CPaddProductsAPI(
      cp_code,
      cp_id,
      cp_ak,
      cp_sk,
      req.body
    );
    console.log("상품등록 API 함수 결과:", result);

    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 쿠팡 상품등록 API 호출 함수
async function CPaddProductsAPI(cp_code, cp_id, cp_ak, cp_sk, reqData) {
  console.log("상품등록 API 호출 함수 실행");
  const productData = reqData.productData;
  const results = [];
  const lastCategoryKey = productData.lastCategory.displayItemCategoryCode;
  const inputNotices = productData.productNotices.details.map((item) => {
      if(item.required) {
        let noticeCategoryDetailName = item.name;
        if(item.name.indexOf("화장품책임판매업자 및 맞춤형화장품판매업자") > -1) {
          noticeCategoryDetailName = '화장품제조업자, 화장품책임판매업자 및 맞춤형화장품판매업자'
        } else {
          noticeCategoryDetailName = item.name;
        }
        return {
          noticeCategoryName: productData.productNotices.name,
          noticeCategoryDetailName: noticeCategoryDetailName,
          content: "상품 상세페이지 참조",
        }
      };
  });

  // 반품지 조회 API 함수 호출
  console.log("반품지 조회 API 함수 호출");
  const returnCenter = await CPgetReturnCenter(cp_code, cp_ak, cp_sk);

  // 출고지 조회 API 함수 호출
  console.log("출고지 조회 API 함수 호출");
  const shippingPlace = await CPgetShippingCenter(cp_code, cp_ak, cp_sk);

  // 상품 루프
  const products = productData.products;
  const modifiedProducts = products.map(product => ({
    ...product,
    name: `${product.name} [구성 및 상세페이지 확인] 샘플증정`, 
    displayName: `${product.displayName} [구성 및 상세페이지 확인] 샘플증정`, 
    discountPrice: parseInt(product.discountPrice) + 1000, // 가격에 1000원 추가
    regularPrice: parseInt(product.regularPrice) + 1300, // 가격에 1000원 추가
  }));
  const combinedProducts = [...products, ...modifiedProducts];
  let productIndex = 0;
  for (const product of combinedProducts) {
    try {
      // 상품명이 없으면 스킵
      if (!product.displayName) {
        console.log("상품명이 없습니다.");
        continue;
      }

      // 요청 JSON 데이터
      const requestData = {
        displayCategoryCode: parseInt(
          lastCategoryKey
        ),
        sellerProductName: product.name || "",
        vendorId: cp_code,
        saleStartedAt: new Date().toISOString().slice(0, 19),
        saleEndedAt: "2099-01-01T23:59:59",
        displayProductName: product.name || "",
        brand: productData.basicInfo.brand || "",
        generalProductName: "",
        productGroup: "",
        deliveryMethod: "SEQUENCIAL", // 일반배송 (고정)
        deliveryCompanyCode: "CJGLS", // 택배사 코드 CJ 대한통운 (고정)
        deliveryChargeType: "FREE", // 무료배송 (고정)
        deliveryCharge: 0,
        freeShipOverAmount: 0,
        deliveryChargeOnReturn: 4500, // 초도반품배송비 4500 (고정)
        remoteAreaDeliverable: "N", // 도서산간 배송여부 N (고정)
        unionDeliveryType: "NOT_UNION_DELIVERY", // 묶음 배송 불가능 (고정)
        returnCenterCode: returnCenter.data.content[0].returnCenterCode,
        returnChargeName: returnCenter.data.content[0].shippingPlaceName,
        companyContactNumber:
          returnCenter.data.content[0].placeAddresses[0].companyContactNumber,
        returnZipCode:
          returnCenter.data.content[0].placeAddresses[0].returnZipCode,
        returnAddress:
          returnCenter.data.content[0].placeAddresses[0].returnAddress,
        returnAddressDetail:
          returnCenter.data.content[0].placeAddresses[0].returnAddressDetail,
        returnCharge: 4500, // 반품배송비 4500 (고정)
        outboundShippingPlaceCode:
          shippingPlace.content[0].outboundShippingPlaceCode,
        vendorUserId: cp_id,
        requested: true,
        items: [
          {
            itemName: `${product.optionValue}, ${product.quantity}`,
            originalPrice: parseInt(product.regularPrice || 0),
            salePrice: parseInt(product.discountPrice || 0),
            maximumBuyCount: 99999, // 최대판매수량 99999 (고정)
            maximumBuyForPerson: 0,
            maximumBuyForPersonPeriod: 1,
            outboundShippingTimeDay: productData.shippingInfo, // 출고 소요일
            unitCount: parseInt(productIndex+1 || 0),
            adultOnly: "EVERYONE",
            taxType: "TAX",
            parallelImported: "NOT_PARALLEL_IMPORTED",
            overseasPurchased: "NOT_OVERSEAS_PURCHASED",
            pccNeeded: false,
            externalVendorSku: null,
            barcode: null,
            emptyBarcode: true,
            emptyBarcodeReason: "",
            modelNo: "",
            extraProperties: {},
            certifications: [],
            attributes: [
              {
                attributeTypeName: product.optionName,
                attributeValueName: product.optionValue,
              },
              {
                attributeTypeName: "수량",
                attributeValueName: product.quantity,
              },
              ...productData.selectedAttributes.flatMap(attr =>
                attr.value.map(v => ({ 
                  attributeTypeName: attr.key,
                  attributeValueName: v,
                  // "exposed": "NONE"
                  }))
              ),
            ],
            images: [],
            contents: [],
            notices: inputNotices,
            searchTags: productData.tags
              ? productData.tags.map((tag) => tag.trim())
              : [], // 검색 태그
          },
        ],
        offerCondition: "NEW",
        offerDescription: null,
        requiredDocuments: null,
        extraInfoMessage: null,
        manufacture: productData.basicInfo.manufacturer || "",
      };

      // 썸네일 이미지 추가 (CDN 업로드)
      console.log("썸네일 이미지 처리");
      const images = product.additionalImages;
      const uploadPromises = images.map(async (image, index) => {
        if (image) {
          const imageData = image.file;
          const fileBuffer = Buffer.from(imageData, "base64");

          // Storage에 이미지 업로드 및 CDN 경로
          const fileName = `images/products/${productIndex}_${index}.jpg`;
          const file = storage.bucket().file(fileName);
          await file.save(fileBuffer, {
            metadata: {
              contentType: "image/jpeg",
            },
          });
          // ** CDN URL 권한 **
          await file.acl.add({
            entity: "allUsers",
            role: "READER",
          });

          const [metadata] = await file.getMetadata();
          const cdnUrl = metadata.mediaLink;

          return {
            imageOrder: index,
            imageType: index === 0 ? "REPRESENTATION" : "DETAIL",
            vendorPath: cdnUrl,
          };
        }
        return null;
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const uploadedImages = await Promise.all(uploadPromises);
      requestData.items[0].images = uploadedImages.filter(
        (image) => image !== null
      );
      console.log("상세페이지 이미지 처리");
      // 상세페이지 이미지 추가 (CDN 업로드)
      if (productData.descImageFiles) {
        let descImageDataList = [];
        // 상품명에 "샘플증정"이 포함되어 있으면 sampleImageFiles 사용
        // 그렇지 않으면 descImageFiles 사용
        if(product.name.indexOf("샘플증정") === -1) {
          descImageDataList = Object.values(productData.descImageFiles);
        } else {
          descImageDataList = Object.values(productData.sampleImageFiles);
        }
        const descImagePromises = descImageDataList.map(
          async (imageData, index) => {
            const fileBuffer = Buffer.from(imageData.file, "base64");

            // Storage에 이미지 업로드 및 CDN 경로
            // 240428 - Error: Error: Retry limit exceeded 문제
            // try-catch, 지연시간 추가 후 실패하면 여러번 재시도하도록 로직 수정 고민
            const fileName = `images/products/desc/${productIndex}_${index}.jpg`;
            const file = storage.bucket().file(fileName);
            await file.save(fileBuffer, {
              metadata: {
                contentType: "image/jpeg",
              },
            });

            // ** CDN URL 권한 **
            await file.acl.add({
              entity: "allUsers",
              role: "READER",
            });

            const [metadata] = await file.getMetadata();
            const cdnUrl = metadata.mediaLink;

            return {
              content: `<img src="${cdnUrl}" style="display: block; margin-left: auto; margin-right: auto;" />`,
              detailType: "TEXT",
            };
          }
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        const uploadedDescImages = await Promise.all(descImagePromises);
        requestData.items[0].contents.push(
          ...uploadedDescImages.map((contentDetail) => ({
            contentsType: "HTML",
            contentDetails: [contentDetail],
          }))
        );
      }

      // 카테고리별 키워드 저장 함수
      await saveKeywords(
        lastCategoryKey,
        productData.tags.join(","),
      );

      // API 호출
      const method = "POST";
      const path =
        "/v2/providers/seller_api/apis/api/v1/marketplace/seller-products";
      const datetime =
        new Date()
          .toISOString()
          .substr(2, 17)
          .replace(/:/gi, "")
          .replace(/-/gi, "") + "Z";

      const message = datetime + method + path;
      const algorithm = "sha256";
      const signature = crypto
        .createHmac(algorithm, cp_sk)
        .update(message)
        .digest("hex");

      const options = {
        hostname: "api-gateway.coupang.com",
        path: path,
        method: method,
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `CEA algorithm=HmacSHA256, access-key=${cp_ak}, signed-date=${datetime}, signature=${signature}`,
        },
      };

      console.log(`${productIndex} 번째 상품 : ${requestData}`);
      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            const parsedData = JSON.parse(data);
            console.log(`Product ${product} response:`, parsedData);
            resolve(parsedData);
          });
        });

        req.on("error", (error) => {
          console.error(`Product ${product} error:`, error);
          reject(error);
        });

        req.write(JSON.stringify(requestData));
        req.end();
      });
      results.push({ product, response });
    } catch (error) {
      console.error(`Product ${product} error:`, error);
      results.push({ product, error: error.message });
    }
    productIndex++;
  }

  return results;
}

// 쿠팡 카테고리 메타 조회 함수
async function getCategoryMeta(cp_ak, cp_sk, displayCategoryCode) {
  console.log("카테고리 메타 정보 조회 함수 실행");

  console.log("displayCategoryCode:", displayCategoryCode);

  // API 호출
  const method = "GET";
  const path = `/v2/providers/seller_api/apis/api/v1/marketplace/meta/category-related-metas/display-category-codes/${displayCategoryCode}`;
  const datetime =
    new Date()
      .toISOString()
      .substr(2, 17)
      .replace(/:/gi, "")
      .replace(/-/gi, "") + "Z";

  const message = datetime + method + path;
  const algorithm = "sha256";
  const signature = crypto
    .createHmac(algorithm, cp_sk)
    .update(message)
    .digest("hex");

  const authorization = `CEA algorithm=HmacSHA256, access-key=${cp_ak}, signed-date=${datetime}, signature=${signature}`;

  const options = {
    hostname: "api-gateway.coupang.com",
    path: path,
    method: method,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: authorization,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        // console.log("카테고리 메타 정보 조회 응답:", data);
        resolve(JSON.parse(data));
      });
    });

    req.on("error", (error) => {
      console.error("카테고리 메타 정보 조회 오류:", error);
      reject(error);
    });

    req.end();
  });
}

// 쿠팡 반품지 확인 함수
async function CPgetReturnCenter(cp_code, cp_ak, cp_sk) {
  console.log("반품지 확인 함수 실행");

  // API 호출
  const method = "GET";
  const path = `/v2/providers/openapi/apis/api/v4/vendors/${cp_code}/returnShippingCenters`;
  const datetime =
    new Date()
      .toISOString()
      .substr(2, 17)
      .replace(/:/gi, "")
      .replace(/-/gi, "") + "Z";

  const message = datetime + method + path;
  const algorithm = "sha256";
  const signature = crypto
    .createHmac(algorithm, cp_sk)
    .update(message)
    .digest("hex");

  const authorization = `CEA algorithm=HmacSHA256, access-key=${cp_ak}, signed-date=${datetime}, signature=${signature}`;

  const options = {
    hostname: "api-gateway.coupang.com",
    path: path,
    method: method,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: authorization,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        // console.log("반품지 확인 응답:", data);
        resolve(JSON.parse(data));
      });
    });

    req.on("error", (error) => {
      console.error("반품지 확인 오류:", error);
      reject(error);
    });

    req.end();
  });
}

// 쿠팡 출고지 조회 함수
async function CPgetShippingCenter(cp_code, cp_ak, cp_sk) {
  console.log("출고지 조회 함수 실행");

  // API 호출
  const method = "GET";
  const path =
    "/v2/providers/marketplace_openapi/apis/api/v1/vendor/shipping-place/outbound";

  const queryParams = {
    pageSize: 10,
    pageNum: 1,
  };

  const searchParams = new URLSearchParams(queryParams);
  const query = searchParams.toString();

  const datetime =
    new Date()
      .toISOString()
      .substr(2, 17)
      .replace(/:/gi, "")
      .replace(/-/gi, "") + "Z";
  const message = datetime + method + path + searchParams.toString();
  const algorithm = "sha256";
  const signature = crypto
    .createHmac(algorithm, cp_sk)
    .update(message)
    .digest("hex");
  const authorization = `CEA algorithm=HmacSHA256, access-key=${cp_ak}, signed-date=${datetime}, signature=${signature}`;

  const options = {
    hostname: "api-gateway.coupang.com",
    port: 443,
    path: `${path}?${query}`,
    method: method,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: authorization,
      "X-EXTENDED-TIMEOUT": 90000,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        // console.log("출고지 조회 응답:", data);
        resolve(JSON.parse(data));
      });
    });

    req.on("error", (error) => {
      console.error("출고지 조회 오류:", error);
      reject(error);
    });

    req.end();
  });
}

// 쿠팡 상품정보제공고시 json 생성 함수
function CPgenerateNotices(categoryMeta, prodType) {
  console.log("상품정보제공고시 생성 함수 실행");
  // console.log("카테고리 메타 정보:", JSON.stringify(categoryMeta, null, 2));

  let noticeCategory = categoryMeta.data.noticeCategories.find(
    (category) => category.noticeCategoryName === prodType
  );

  if (!noticeCategory) {
    noticeCategory = categoryMeta.data.noticeCategories.find(
      (category) => category.noticeCategoryName === "기타 재화"
    );
  }

  // 일치 카테고리, 기타 재화도 없을 경우 첫번째 카테고리 선택
  if (!noticeCategory) {
    noticeCategory = categoryMeta.data.noticeCategories[0];
  }

  if (noticeCategory) {
    const mandatoryNotices = noticeCategory.noticeCategoryDetailNames.filter(
      (notice) => notice.required === "MANDATORY"
    );

    const notices = mandatoryNotices.map((notice) => ({
      noticeCategoryName: noticeCategory.noticeCategoryName,
      noticeCategoryDetailName: notice.noticeCategoryDetailName,
      content: "상품 상세페이지 참조",
    }));

    // console.log("상품정보제공고시:", notices);

    return notices;
  }

  return [];
}

// 쿠팡 상품 판매상태 변경 API
app.put("/CPchangeProductStatus", async (req, res) => {
  console.log("쿠팡 판매상태 변경");
  console.log(req.body);

  let accData = req.body.accName;
  await db
    .collection("Accounts")
    .doc(accData)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        res.status(404).json({
          result: "error",
          message: "ACC 데이터 조회 실패",
        });
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 조회 실패",
      });
    });

  const cp_code = accData.cp_code; // 셀러 ID
  const cp_ak = accData.cp_ak; // Access Key
  const cp_sk = accData.cp_sk; // Secret Key
  const statusTo = req.body.selectedStatus;
  const selectedProducts = req.body.selectedProducts;

  // 상품 반복
  const results = [];
  for (const product of selectedProducts) {
    console.log(product.productId);

    // 상품 상세조회 (아이템 코드, 현재 상태 확인)
    const detailedProductInfo = await getSellerProduct(
      product.productId,
      cp_ak,
      cp_sk
    );
    const vendorItemId = detailedProductInfo.data.items[0].vendorItemId;
    console.log("vendorItemId:", vendorItemId);

    // null이면 아이템 스킵
    if (!vendorItemId) {
      continue;
    }

    // 상태 변경 요청
    const apiPath =
      statusTo === "SALE"
        ? `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${vendorItemId}/sales/resume`
        : `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${vendorItemId}/sales/stop`;

    const method = "PUT";
    const datetime =
      new Date()
        .toISOString()
        .substr(2, 17)
        .replace(/:/gi, "")
        .replace(/-/gi, "") + "Z";
    const message = datetime + method + apiPath;
    const algorithm = "sha256";
    const signature = crypto
      .createHmac(algorithm, cp_sk)
      .update(message)
      .digest("hex");
    const authorization = `CEA algorithm=HmacSHA256, access-key=${cp_ak}, signed-date=${datetime}, signature=${signature}`;

    const options = {
      hostname: "api-gateway.coupang.com",
      path: apiPath,
      method: method,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: authorization,
      },
    };

    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            resolve(JSON.parse(data));
          });
        });
        req.on("error", (error) => {
          console.error("상품 판매상태 변경 오류:", error);
          reject(error);
        });
        req.end();
      });

      console.log("상품 판매상태 변경 응답:", response);
      results.push({
        productId: product.productId,
        vendorItemId: vendorItemId,
        status: statusTo,
        result: response,
      });
    } catch (error) {
      console.error("상품 판매상태 변경 오류:", error);
      results.push({
        productId: product.productId,
        vendorItemId: vendorItemId,
        status: statusTo,
        result: error,
      });
    }
  }

  res.json(results);
});

// ##### 네이버 #####
const bcrypt = require("bcrypt");
const { object } = require("firebase-functions/v1/storage");
const { group } = require("console");

// 전자서명 생성 함수
function generateSignature(clientId, clientSecret, timestamp) {
  const password = `${clientId}_${timestamp}`;
  const hashedPassword = bcrypt.hashSync(password, clientSecret);
  const signature = Buffer.from(hashedPassword, "utf-8").toString("base64");
  console.log("Signature:", signature);

  return signature;
}

// 인증 토큰 발급 요청 함수
async function getAccessToken(clientId, clientSecret, type, accountId) {
  const timestamp = Date.now();
  const signature = generateSignature(clientId, clientSecret, timestamp);

  const authUrl = "https://api.commerce.naver.com/external/v1/oauth2/token";
  const data = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret_sign: signature,
    timestamp: timestamp,
    type: type,
    account_id: accountId || "",
  });

  try {
    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: data,
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}

async function getNaverAccount(accName) {
  if (!accName) {
    throw new Error("선택된계정 정보가 없습니다.");
  }

  const doc = await db.collection("Accounts").doc(accName).get();
  if (!doc.exists) {
    throw new Error("ACC 데이터 조회 실패");
  }

  console.log("계정명:", doc.id);
  return doc.data();
}

const NAVER_SIZE_REGISTRATION_LOCK_MS = 10 * 60 * 1000;
const NAVER_SIZE_REGISTRATION_BUDGET_MS = 500 * 1000;

function getNaverSizeRegistrationLockRef(accName) {
  const accountKey = crypto
    .createHash("sha256")
    .update(String(accName || ""))
    .digest("hex");
  return db.collection("NaverSizeRegistrationLocks").doc(accountKey);
}

async function claimNaverSizeRegistration(accName, requestId) {
  const lockRef = getNaverSizeRegistrationLockRef(accName);
  const now = Date.now();

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(lockRef);
    const lock = snapshot.exists ? snapshot.data() : {};

    if (lock.lastCompletedRequestId === requestId && lock.lastResponse) {
      return { status: "completed", response: lock.lastResponse, lockRef };
    }

    if (Number(lock.lockedUntil || 0) > now) {
      return { status: "busy", lockRef };
    }

    transaction.set(
      lockRef,
      {
        accountName: String(accName),
        currentRequestId: requestId,
        lockedUntil: now + NAVER_SIZE_REGISTRATION_LOCK_MS,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { status: "claimed", lockRef };
  });
}

async function completeNaverSizeRegistration(lockRef, requestId, responsePayload) {
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(lockRef);
    const lock = snapshot.exists ? snapshot.data() : {};
    if (lock.currentRequestId !== requestId) return;

    transaction.set(
      lockRef,
      {
        currentRequestId: admin.firestore.FieldValue.delete(),
        lockedUntil: 0,
        lastCompletedRequestId: requestId,
        lastResponse: responsePayload,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
}

async function updateNaverSizeRegistrationProgress(lockRef, requestId, progress) {
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(lockRef);
    if (!snapshot.exists || snapshot.data()?.currentRequestId !== requestId) return;

    transaction.set(
      lockRef,
      {
        progress: {
          ...progress,
          requestId,
        },
        progressUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
}

async function releaseNaverSizeRegistration(lockRef, requestId) {
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(lockRef);
    if (!snapshot.exists || snapshot.data()?.currentRequestId !== requestId) return;

    transaction.set(
      lockRef,
      {
        currentRequestId: admin.firestore.FieldValue.delete(),
        lockedUntil: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
}

// 네이버 태그 조회 API
app.post("/getRecommendTags", async (req, res) => {
  console.log("네이버 태그 추천 조회");
  // 계정 API Key 조회
  let accData = req.body.accName;

  if (accData == undefined) {
    res.status(400).json({
      result: "error",
      message: "선택된계정 정보가 없습니다.",
    });
  }

  await db
    .collection("Accounts")
    .doc(accData)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        res.status(404).json({
          result: "error",
          message: "ACC 데이터 조회 실패",
        });
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 조회 실패",
      });
    });

  const n_id = accData.n_id; // app id
  const n_sk = accData.n_sk; // Secret Key3

  // 요청 파라미터 설정
  let keyword = req.body.keyword;

  try {
    const accessToken = await getAccessToken(n_id, n_sk, "SELF");
    const params = {keyword: keyword};
    const paramString = new URLSearchParams(params).toString();
    const apiUrl = `https://api.commerce.naver.com/external/v2/tags/recommend-tags?${paramString}`;
    const headers = {
      Authorization: `Bearer ${accessToken.access_token}`
    };

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });
    const responseData = await response.json();
    res.json(responseData);

  } catch (error) {
    console.error("Error fetching tag list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the tag list." });
  }
});

// 네이버 제한 태그 조회 API
app.post("/getTagRestrictions", async (req, res) => {
  console.log("네이버 제한 태그 조회");

  // 계정 API Key 조회
  let accData = req.body.accName;

  if (accData == undefined) {
    res.status(400).json({
      result: "error",
      message: "선택된계정 정보가 없습니다.",
    });
  }

  await db
    .collection("Accounts")
    .doc(accData)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        res.status(404).json({
          result: "error",
          message: "ACC 데이터 조회 실패",
        });
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 조회 실패",
      });
    });

  const n_id = accData.n_id; // app id
  const n_sk = accData.n_sk; // Secret Key3

  // 요청 파라미터 설정
  let tags = req.body.tags;

  try {
    const accessToken = await getAccessToken(n_id, n_sk, "SELF");
    
    const params = {tags: tags};
    const paramString = new URLSearchParams(params).toString();
    const apiUrl = `https://api.commerce.naver.com/external/v2/tags/restricted-tags?${paramString}`;
    const headers = {
      Authorization: `Bearer ${accessToken.access_token}`
    };

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });
    const responseData = await response.json();
    res.json(responseData);

  } catch (error) {
    console.error("Error fetching tag list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the tag list." });
  }
});

// 네이버 상품정보제공고시 상품군
app.post("/getProductProvidedNotice", async (req, res) => {
  console.log("상품정보제공고시 상품군 조회");

  // 계정 API Key 조회
  let accData = req.body.accName;

  if (accData == undefined) {
    res.status(400).json({
      result: "error",
      message: "선택된계정 정보가 없습니다.",
    });
  }

  await db
    .collection("Accounts")
    .doc(accData)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        res.status(404).json({
          result: "error",
          message: "ACC 데이터 조회 실패",
        });
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 조회 실패",
      });
    });

  const n_id = accData.n_id; // app id
  const n_sk = accData.n_sk; // Secret Key3

  // 요청 파라미터 설정
  let categoryId = req.body.categoryId;

  try {
    const accessToken = await getAccessToken(n_id, n_sk, "SELF");
    
    const params = {categoryId: categoryId};
    const paramString = new URLSearchParams(params).toString();
    const apiUrl = `https://api.commerce.naver.com/external/v1/products-for-provided-notice?${paramString}`;
    const headers = {
      Authorization: `Bearer ${accessToken.access_token}`
    };

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });
    const responseData = await response.json();
    res.json(responseData);

  } catch (error) {
    console.error("Error fetching tag list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the tag list." });
  }
});

// 네이버 상품 목록 조회 API
app.post("/NsearchProd", async (req, res) => {
  console.log("네이버 상품 목록 조회");
  console.log(req.body);

  // 계정 API Key 조회
  let accData = req.body.accName;

  if (accData == undefined) {
    res.status(400).json({
      result: "error",
      message: "선택된계정 정보가 없습니다.",
    });
  }

  await db
    .collection("Accounts")
    .doc(accData)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        res.status(404).json({
          result: "error",
          message: "ACC 데이터 조회 실패",
        });
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      res.status(500).json({
        result: "error",
        message: "ACC 데이터 조회 실패",
      });
    });

  const n_id = accData.n_id; // app id
  const n_sk = accData.n_sk; // Secret Key3

  // 요청 파라미터 설정
  let page = 1;
  let maxPerPage = 10;

  let requestBody = {
    page: page,
    size: maxPerPage,
  };

  if (req.body.prodnum) {
    requestBody.searchKeywordType = "PRODUCT_NO";
    requestBody.originProductNos = req.body.prodnum;
  }

  if (req.body.page) {
    requestBody.page = req.body.page;
  }

  // 요청 JSON 데이터
  console.log("Request Data:", requestBody);

  // 상품 목록 조회 API 호출
  try {
    const accessToken = await getAccessToken(n_id, n_sk, "SELF");
    

    const apiUrl = "https://api.commerce.naver.com/external/v1/products/search";
    const headers = {
      Authorization: `Bearer ${accessToken.access_token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    // console.log("Response Data:", JSON.stringify(responseData, null, 2));

    responseData.contents.forEach((product) => {
      console.log(product.originProductNo);
    });

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching product list:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the product list." });
  }
});

// 네이버 판매가 수정 API
app.use("/NmodifyProducts", async (req, res) => {
  console.log("네이버 판매가 수정");
  console.log(req.body);

  try {
    // 계정 API Key 조회
    let accData;
    await db
      .collection("Accounts")
      .doc(req.body.accName)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          console.log("No such document!");
          throw new Error("ACC 데이터 조회 실패");
        } else {
          accData = doc.data();
          console.log("계정명:", doc.id);
        }
      })
      .catch((err) => {
        console.log("Error getting document", err);
        throw new Error("ACC 데이터 조회 실패");
      });

    const n_id = accData.n_id; // app ID
    const n_sk = accData.n_sk; // Secret Key
    const selectedProducts = req.body.selectedProducts;
    const accessToken = await getAccessToken(n_id, n_sk, "SELF");
    

    for (const product of selectedProducts) {
      const { productId, salePrice } = product;

      // 상품 상세조회
      let requestData = await NgetProductDetail(
        accessToken.access_token,
        productId
      );

      // 네이버 API 호출을 위한 설정
      const url = `https://api.commerce.naver.com/external/v2/products/origin-products/${productId}`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: accessToken.access_token,
      };

      // 상품 상세조회 데이터에서 판매가 수정
      requestData.originProduct.salePrice = salePrice;

      // 택배사 없다면 추가 추가
      if (!requestData.originProduct.deliveryInfo.deliveryCompany) {
        requestData.originProduct.deliveryInfo.deliveryCompany = "CJGLS";
      }

      // 요청 데이터
      console.log(JSON.stringify(requestData, null, 2));

      // 네이버 상품 수정 API 호출
      const response = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(requestData),
      });

      // 응답 처리
      if (response.ok) {
        const responseText = await response.text();
        console.log("응답 메시지:", responseText);
        console.log(`상품 ${productId} 판매가 수정 성공`);
      } else {
        const errorData = await response.json();
        console.error(`상품 ${productId} 판매가 수정 실패:`, errorData.message);
        // 에러 메시지를 클라이언트로 응답
        res.status(response.status).json({
          error: errorData.message || "상품 수정 중 오류가 발생했습니다.",
        });
        return; // 에러 응답 후 함수 종료
      }
    }

    res.status(200).json({ message: "상품 수정이 완료되었습니다." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      error: error.message || "상품 수정 중 오류가 발생했습니다.",
    });
  }
});

// 네이버 상품 상세 조회 함수
async function NgetProductDetail(accessToken, originProductNo) {
  console.log("네이버 상품 상세 조회 함수 실행");

  try {
    const apiUrl = `https://api.commerce.naver.com/external/v2/products/origin-products/${originProductNo}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      const responseData = await response.json();
      // console.log(
      //   "네이버 상품 상세조회:",
      //   JSON.stringify(responseData, null, 2)
      // );
      return responseData;
    } else {
      const errorData = await response.json();
      console.error("Error fetching product details:", errorData);
      throw new Error("상품 상세 정보 조회 중 오류가 발생했습니다.");
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
}

// 네이버 상품 이미지 수정 API
app.use("/NmodifyProductImages", async (req, res) => {
  console.log("네이버 상품 이미지 수정");
  console.log(req.body);

  // 계정 API Key 조회
  let accData;
  await db
    .collection("Accounts")
    .doc(req.body.accName)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        throw new Error("ACC 데이터 조회 실패");
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      throw new Error("ACC 데이터 조회 실패");
    });

  const n_id = accData.n_id; // app ID
  const n_sk = accData.n_sk; // Secret Key
  const { productId, imageType, images } = req.body;
  const accessToken = await getAccessToken(n_id, n_sk, "SELF");
  

  // 상품 상세조회
  let requestData = await NgetProductDetail(
    accessToken.access_token,
    productId
  );

  // 이미지 다건 업로드 API 함수 호출
  const uploadedImagesResponse = await NuploadProductImages(
    accessToken.access_token,
    images
  );
  const uploadedImages = uploadedImagesResponse.images.map(
    (image) => image.url
  );
  console.log("업로드 이미지:", uploadedImages);

  // 이미지 타입에 따라 상품 상세 정보 업데이트
  if (imageType === "main") {
    requestData.originProduct.images.representativeImage = null;
    requestData.originProduct.images.optionalImages = [];
    requestData.originProduct.images.representativeImage = {
      url: uploadedImages[0],
    };
    requestData.originProduct.images.optionalImages = uploadedImages
      .slice(1)
      .map((url) => ({ url }));
  } else if (imageType === "desc") {
    const newDetailContent = uploadedImages
      .map((imageUrl) => `<img src="${imageUrl}"><br>`)
      .join("");
    requestData.originProduct.detailContent = newDetailContent;
  }

  console.log("요청 데이터:", JSON.stringify(requestData, null, 2));
  try {
    // 네이버 API 호출을 위한 설정
    const url = `https://api.commerce.naver.com/external/v2/products/origin-products/${productId}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: accessToken.access_token,
    };

    // 택배사 없다면 추가
    if (!requestData.originProduct.deliveryInfo.deliveryCompany) {
      requestData.originProduct.deliveryInfo.deliveryCompany = "CJGLS";
    }

    // 요청 데이터
    console.log(JSON.stringify(requestData, null, 2));

    // 네이버 상품 수정 API 호출
    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(requestData),
    });

    // 응답 처리
    if (response.ok) {
      const responseText = await response.text();
      console.log("응답 메시지:", responseText);
      console.log(`상품 ${productId} 이미지 수정 성공`);
    } else {
      const errorData = await response.json();
      console.error(`상품 ${productId} 이미지 수정 실패:`, errorData.message);
      // 에러 메시지를 클라이언트로 응답
      res.status(response.status).json({
        error: errorData.message || "이미지 수정 중 오류가 발생했습니다.",
      });
      return; // 에러 응답 후 함수 종료
    }
    res.status(200).json({ message: "이미지 수정이 완료되었습니다." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      error: error.message || "이미지 수정 중 오류가 발생했습니다.",
    });
  }
});

// 네이버 이미지 다건 업로드 API 함수
async function NuploadProductImages(accessToken, base64Images) {
  console.log("네이버 이미지 다건 업로드 API 함수 실행");

  // 1초 대기
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const apiUrl =
      "https://api.commerce.naver.com/external/v1/product-images/upload";
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const formData = new FormData();
    base64Images.forEach((base64Image, index) => {
      // console.log("base64Image:", base64Image);

      // 240408 - mimeType 구분 함수 추가
      const mimeType = getMimeType(base64Image);
      const blob = b64toBlob(base64Image, mimeType); // Base64 문자열 접두사 제거

      console.log("mimeType:", mimeType);
      console.log("blob:", blob);

      formData.append(
        "imageFiles",
        blob,
        `image_${index}.${mimeType.split("/")[1]}`
      );
    });
    console.log("formData:", formData);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (response.ok) {
      const responseData = await response.json();

      return responseData;
    } else {
      const errorData = await response.json();
      console.error("이미지 업로드 실패:", errorData);
      throw new Error(
        errorData.message || "이미지 업로드 중 오류가 발생했습니다."
      );
    }
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    throw error;
  }
}

// base64 -> Blob 변환 함수
function b64toBlob(base64Image, mimeType) {
  const byteString = atob(base64Image);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}

// 바이트 시그니처를 사용하여 MIME 타입 추론
function getMimeType(base64Image) {
  const signatures = {
    "/9j/": "image/jpeg",
    iVBORw0: "image/png",
    R0lGOD: "image/gif",
    Qk02: "image/bmp",
    Qk06: "image/bmp",
    // 필요한 경우 더 많은 시그니처 추가
  };

  for (const signature in signatures) {
    if (base64Image.substring(0, 10).includes(signature)) {
      return signatures[signature];
    }
  }

  // 일치하는 시그니처가 없는 경우 기본값으로 image/jpeg 반환
  return "image/jpeg";
}

// 네이버 1차 카테고리 조회 API
app.post("/NsearchRootCategory", async (req, res) => {
  console.log("네이버 1차 카테고리 조회");

  // 계정 API Key 조회
  let accData = req.body.accName;

  await db
    .collection("Accounts")
    .doc(req.body.accName)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        throw new Error("ACC 데이터 조회 실패");
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      throw new Error("ACC 데이터 조회 실패");
    });

  const n_id = accData.n_id; // app ID
  const n_sk = accData.n_sk; // Secret Key

  const accessToken = await getAccessToken(n_id, n_sk, "SELF");
  

  try {
    // 네이버 API 호출

    const apiUrl = `https://api.commerce.naver.com/external/v1/categories?last=false`;
    const headers = {
      Authorization: `Bearer ${accessToken.access_token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      const categories = await response.json();
      const firstcategories = categories.filter(category=> {return category.wholeCategoryName.indexOf(">") < 0})
      res.json(firstcategories);
    } else {
      const errorMessage = await response.text();
      console.error("Error:", errorMessage);
      res.status(response.status).json({
        result: "error",
        message: "카테고리 조회 실패",
      });
    }
  } catch (error) {
    console.error("API 요청 에러:", error);
    res.status(500).json({
      result: "error",
      message: "카테고리 조회 실패",
    });
  }
});

// 네이버 하위 카테고리 조회 API
app.post("/NsearchCategory", async (req, res) => {
  console.log("네이버 카테고리 조회");

  const categoryCode = req.body.categoryCode;

  // 계정 API Key 조회
  let accData = req.body.accName;

  await db
    .collection("Accounts")
    .doc(req.body.accName)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        throw new Error("ACC 데이터 조회 실패");
      } else {
        accData = doc.data();
      }
    })
    .catch((err) => {
      throw new Error("ACC 데이터 조회 실패");
    });

  const n_id = accData.n_id; // app ID
  const n_sk = accData.n_sk; // Secret Key

  const accessToken = await getAccessToken(n_id, n_sk, "SELF");

  try {
    // 네이버 API 호출

    const apiUrl = `https://api.commerce.naver.com/external/v1/categories/${categoryCode}/sub-categories`;
    const headers = {
      Authorization: `Bearer ${accessToken.access_token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      const categories = await response.json();

      res.json(categories);
    } else {
      const errorMessage = await response.text();
      console.error("Error:", errorMessage);
      res.status(response.status).json({
        result: "error",
        message: "카테고리 조회 실패",
      });
    }
  } catch (error) {
    console.error("API 요청 에러:", error);
    res.status(500).json({
      result: "error",
      message: "카테고리 조회 실패",
    });
  }
});

// 네이버 카테고리 조회
async function NsearchCategory(categoryCode, accessToken) {
  try {
    const response = await fetch(
      `https://api.commerce.naver.com/external/v1/categories/${categoryCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const category = await response.json();
      return category;
    } else {
      const errorMessage = await response.text();
      return null;
    }
  } catch (error) {
    return null;
  }
};

app.post("/NsearchCategoryDetail", async (req, res) => {
  const categoryCode = req.body.categoryCode;

  let accData = req.body.accName;

  await db
    .collection("Accounts")
    .doc(req.body.accName)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        throw new Error("ACC 데이터 조회 실패");
      } else {
        accData = doc.data();
      }
    })
    .catch((err) => {
      throw new Error("ACC 데이터 조회 실패");
    });

  const n_id = accData.n_id;
  const n_sk = accData.n_sk;

  try {
    const accessToken = await getAccessToken(n_id, n_sk, "SELF");
    const category = await NsearchCategory(categoryCode, accessToken.access_token);

    if (!category) {
      return res.status(500).json({
        result: "error",
        message: "카테고리 상세 조회 실패",
      });
    }

    const isUnitPriceCategory = Array.isArray(category.exceptionalCategories) &&
      category.exceptionalCategories.includes("UNIT_PRICE");

    return res.json({
      ...category,
      isUnitPriceCategory,
    });
  } catch (error) {
    return res.status(500).json({
      result: "error",
      message: "카테고리 상세 조회 실패",
    });
  }
});

const UNIT_PRICE_INDICATION_UNITS = new Set([
  "g",
  "kg",
  "ml",
  "L",
  "cm",
  "m",
  "개",
  "개입",
  "매",
  "매입",
  "정",
  "캡슐",
  "구미",
  "포",
  "구",
]);

function normalizeUnitCapacityInfo(info) {
  return {
    unitPriceYn: info?.unitPriceYn === true,
    totalCapacityValue: info?.totalCapacityValue ?? "",
    unitCapacity: info?.unitCapacity ?? "",
    indicationUnit: info?.indicationUnit ?? "",
  };
}

async function getRecommendedUnitPriceGuide(categoryCode, accessToken) {
  try {
    console.log("[Naver][UnitPriceGuide] request", { categoryCode });

    const response = await fetch(
      `https://api.commerce.naver.com/external/v2/standard-purchase-option-guides?categoryId=${categoryCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.log("[Naver][UnitPriceGuide] response error", {
        categoryCode,
        status: response.status,
        body: errorBody,
      });
      return {
        unitPriceValue: "",
        unitPriceText: "",
      };
    }

    const guideData = await response.json();
    console.log("[Naver][UnitPriceGuide] raw response", {
      categoryCode,
      body: guideData,
    });

    const optionGuides = Array.isArray(guideData?.optionGuides)
      ? guideData.optionGuides
      : [];

    const matchedGuide = optionGuides.find((guide) => (
      guide?.useUnitPrice === true &&
      guide?.unitPriceValue !== null &&
      guide?.unitPriceValue !== undefined &&
      typeof guide?.unitPriceText === "string" &&
      guide.unitPriceText.trim() !== ""
    ));

    if (!matchedGuide) {
      console.log("[Naver][UnitPriceGuide] parsed response", {
        categoryCode,
        unitPriceValue: "",
        unitPriceText: "",
      });
      return {
        unitPriceValue: "",
        unitPriceText: "",
      };
    }

    const result = {
      unitPriceValue: String(matchedGuide.unitPriceValue ?? ""),
      unitPriceText: UNIT_PRICE_INDICATION_UNITS.has(matchedGuide.unitPriceText)
        ? matchedGuide.unitPriceText
        : "",
    };

    console.log("[Naver][UnitPriceGuide] parsed response", {
      categoryCode,
      ...result,
    });

    return result;
  } catch (error) {
    console.log("[Naver][UnitPriceGuide] request failed", {
      categoryCode,
      message: error?.message,
    });
    return {
      unitPriceValue: "",
      unitPriceText: "",
    };
  }
}

async function getStandardOptionGroups(categoryCode, accessToken) {
  try {
    const response = await fetch(
      `https://api.commerce.naver.com/external/v1/options/standard-options?categoryId=${encodeURIComponent(categoryCode)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.log("[Naver][StandardOptions] response error", {
        categoryCode,
        status: response.status,
        body: errorBody,
      });
      return [];
    }

    const data = await response.json();
    const source = data?.data ?? data;
    const candidates = [
      source?.standardOptionGroups,
      source?.standardOptionCategoryGroups,
      source?.standardOptions,
      source?.optionGroups,
      source?.options,
      source?.contents,
      source?.content,
      source?.list,
      Array.isArray(source) ? source : null,
    ];

    const entries = [];
    candidates.forEach((candidate) => {
      if (Array.isArray(candidate)) entries.push(...candidate);
    });

    const groups = [];
    entries.forEach((entry) => {
      if (entry?.useStandardOption === false) return;
      if (Array.isArray(entry?.standardOptionCategoryGroups)) {
        groups.push(...entry.standardOptionCategoryGroups);
        return;
      }
      if (getStandardOptionGroupName(entry)) groups.push(entry);
    });

    return groups;
  } catch (error) {
    console.log("[Naver][StandardOptions] request failed", {
      categoryCode,
      message: error?.message,
    });
    return [];
  }
}

function getStandardOptionGroupName(group) {
  return String(
    group?.groupName ??
    group?.optionName ??
    group?.name ??
    group?.attributeName ??
    ""
  ).trim();
}

function getStandardOptionAttributes(group) {
  const candidates = [
    group?.standardOptionAttributes,
    group?.attributes,
    group?.optionValues,
    group?.values,
    group?.children,
  ];

  const attributes = [];
  candidates.forEach((candidate) => {
    if (Array.isArray(candidate)) attributes.push(...candidate);
  });

  return attributes;
}

function getStandardOptionAttributeName(attribute) {
  return String(
    attribute?.attributeValueName ??
    attribute?.valueName ??
    attribute?.name ??
    attribute?.label ??
    ""
  ).trim();
}

function normalizeOptionText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/(?:mm|cm)$/g, "");
}

function getSizeOptionAliases(value) {
  const normalized = normalizeOptionText(value);
  const aliases = new Set([normalized]);

  if (
    ["free", "f", "프리", "프리사이즈", "onesize", "one-size", "one"].includes(normalized)
  ) {
    ["free", "f", "프리", "프리사이즈", "onesize", "one"].forEach((alias) => {
      aliases.add(alias);
    });
  }

  return aliases;
}

function isSameSizeOptionName(sizeLabel, optionLabel) {
  const sizeAliases = getSizeOptionAliases(sizeLabel);
  const optionAliases = getSizeOptionAliases(optionLabel);

  for (const alias of sizeAliases) {
    if (optionAliases.has(alias)) return true;
  }

  return false;
}

function buildStandardColorSizeOptionInfo(
  colorRows,
  sizeRows,
  selectedCombinations,
  standardOptionGroups,
  stockQuantity
) {
  const colorGroups = standardOptionGroups.filter((group) => {
    const groupName = normalizeOptionText(getStandardOptionGroupName(group));
    return groupName.includes("색상") || groupName.includes("컬러") || groupName.includes("color");
  });
  const sizeGroups = standardOptionGroups.filter((group) => {
    const groupName = normalizeOptionText(getStandardOptionGroupName(group));
    return groupName.includes("사이즈") || groupName.includes("크기") || groupName.includes("size");
  });

  const colorGroup = colorGroups.find((group) => {
    const attributes = getStandardOptionAttributes(group);
    return colorRows.every((color) =>
      attributes.some(
        (attribute) =>
          normalizeOptionText(color.label) ===
          normalizeOptionText(getStandardOptionAttributeName(attribute))
      )
    );
  });
  const sizeGroup = sizeGroups.find((group) => {
    const attributes = getStandardOptionAttributes(group);
    return sizeRows.every((size) =>
      attributes.some((attribute) =>
        isSameSizeOptionName(size.label, getStandardOptionAttributeName(attribute))
      )
    );
  });

  if (!colorGroup || !sizeGroup) return null;

  const colorAttributes = getStandardOptionAttributes(colorGroup);
  const sizeAttributes = getStandardOptionAttributes(sizeGroup);
  const matchedColorAttributes = colorRows.map((color) =>
    colorAttributes.find(
      (attribute) =>
        normalizeOptionText(color.label) ===
        normalizeOptionText(getStandardOptionAttributeName(attribute))
    )
  );
  const matchedAttributes = sizeRows.map((size) => {
    return sizeAttributes.find((attribute) =>
      isSameSizeOptionName(size.label, getStandardOptionAttributeName(attribute))
    );
  });

  if (
    matchedColorAttributes.some((attribute) => !attribute) ||
    matchedAttributes.some((attribute) => !attribute)
  ) {
    return null;
  }

  const mapStandardAttribute = (attribute, fallbackName) => {
    const attributeId = Number(attribute?.attributeId ?? attribute?.id ?? attribute?.attributeSeq);
    const attributeValueId = Number(
      attribute?.attributeValueId ?? attribute?.valueId ?? attribute?.attributeValueSeq
    );

    return {
      attributeId,
      attributeValueId,
      attributeValueName: getStandardOptionAttributeName(attribute) || fallbackName,
      imageUrls: Array.isArray(attribute?.imageUrls) ? attribute.imageUrls : [],
    };
  };

  const standardColorAttributes = matchedColorAttributes.map((attribute, index) =>
    mapStandardAttribute(attribute, colorRows[index].label)
  );
  const standardSizeAttributes = matchedAttributes.map((attribute, index) =>
    mapStandardAttribute(attribute, sizeRows[index].label)
  );

  if (
    [...standardColorAttributes, ...standardSizeAttributes].some(
      (attribute) =>
        !Number.isFinite(attribute.attributeId) ||
        !Number.isFinite(attribute.attributeValueId)
    )
  ) {
    return null;
  }

  const colorNameMap = new Map(
    colorRows.map((color, index) => [
      normalizeOptionText(color.label),
      standardColorAttributes[index].attributeValueName,
    ])
  );
  const sizeNameMap = new Map(
    sizeRows.map((size, index) => [
      normalizeOptionText(size.label),
      standardSizeAttributes[index].attributeValueName,
    ])
  );

  return {
    simpleOptionSortType: "CREATE",
    optionSimple: [],
    optionCustom: [],
    optionCombinationSortType: "CREATE",
    standardOptionGroups: [
      {
        groupName: getStandardOptionGroupName(colorGroup) || "색상",
        standardOptionAttributes: standardColorAttributes,
      },
      {
        groupName: getStandardOptionGroupName(sizeGroup) || "사이즈",
        standardOptionAttributes: standardSizeAttributes,
      },
    ],
    optionStandards: selectedCombinations.map((combination) => ({
      id: 0,
      optionName1: colorNameMap.get(normalizeOptionText(combination.color)),
      optionName2: sizeNameMap.get(normalizeOptionText(combination.size)),
      stockQuantity,
      usable: true,
    })),
    useStockManagement: true,
    optionDeliveryAttributes: [],
  };
}

function buildCombinationColorSizeOptionInfo(selectedCombinations, stockQuantity) {
  return {
    simpleOptionSortType: "CREATE",
    optionSimple: [],
    optionCustom: [],
    optionCombinationSortType: "CREATE",
    optionCombinationGroupNames: {
      optionGroupName1: "색상",
      optionGroupName2: "사이즈",
    },
    optionCombinations: selectedCombinations.map((combination) => ({
      id: 0,
      optionName1: String(combination.color),
      optionName2: String(combination.size),
      stockQuantity,
      price: 0,
      usable: true,
    })),
    standardOptionGroups: [],
    optionStandards: [],
    useStockManagement: true,
    optionDeliveryAttributes: [],
  };
}

function buildCombinationSizeOptionInfo(selectedCombinations, stockQuantity) {
  return {
    simpleOptionSortType: "CREATE",
    optionSimple: [],
    optionCustom: [],
    optionCombinationSortType: "CREATE",
    optionCombinationGroupNames: {
      optionGroupName1: "사이즈",
    },
    optionCombinations: selectedCombinations.map((combination) => ({
      id: 0,
      optionName1: String(combination.size),
      stockQuantity,
      price: 0,
      usable: true,
    })),
    standardOptionGroups: [],
    optionStandards: [],
    useStockManagement: true,
    optionDeliveryAttributes: [],
  };
}

function buildSizeRegistrationOptionLabel(combination, withoutColor) {
  return withoutColor
    ? String(combination.size || "").trim()
    : [combination.color, combination.size]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" ");
}

function buildSizeRegistrationProductName(baseProductName, combination, withoutColor) {
  const optionLabel = buildSizeRegistrationOptionLabel(combination, withoutColor);
  return [baseProductName, optionLabel].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function getSizeRegistrationCombinationKey(combination, withoutColor) {
  const size = normalizeOptionText(combination?.size);
  if (withoutColor) return size;
  return `${normalizeOptionText(combination?.color)}:${size}`;
}

async function registerNaverProductWithRetry(
  requestData,
  accessToken,
  maxAttempts = 3,
  deadlineAt = Number.POSITIVE_INFINITY
) {
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (Date.now() >= deadlineAt) {
      throw new Error("서버 제한 시간에 도달해 상품 등록을 중단했습니다.");
    }

    try {
      const response = await fetch(
        "https://api.commerce.naver.com/external/v2/products",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );
      const responseText = await response.text();
      let responseData = {};

      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          responseData = { raw: responseText };
        }
      }

      if (response.ok) return responseData;

      const responseError = new Error(
        responseData?.message ||
          responseData?.invalidInputs?.map((input) => input.message || input.name).filter(Boolean).join(", ") ||
          responseText ||
          "네이버 상품 등록 실패"
      );
      responseError.status = response.status;
      responseError.responseData = responseData;
      lastError = responseError;

      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === maxAttempts - 1) throw responseError;
    } catch (error) {
      lastError = error;
      const retryable = !error.status || error.status === 429 || error.status >= 500;
      if (!retryable || attempt === maxAttempts - 1) throw error;
    }

    const retryDelay = 1000 * 2 ** attempt;
    if (Date.now() + retryDelay >= deadlineAt) {
      throw lastError || new Error("서버 제한 시간에 도달해 상품 등록을 중단했습니다.");
    }
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }

  throw lastError || new Error("네이버 상품 등록 실패");
}

app.post("/NsearchStandardOptions", async (req, res) => {
  try {
    const categoryId = req.body.categoryId;
    if (!categoryId) {
      return res.status(400).json({
        result: "error",
        message: "카테고리 번호가 필요합니다.",
      });
    }

    const accData = await getNaverAccount(req.body.accName);
    const accessToken = await getAccessToken(accData.n_id, accData.n_sk, "SELF");
    const standardOptionGroups = await getStandardOptionGroups(
      categoryId,
      accessToken.access_token
    );

    return res.json({
      result: "success",
      standardOptionGroups,
    });
  } catch (error) {
    console.error("네이버 카테고리 간편옵션 조회 실패:", error);
    return res.status(500).json({
      result: "error",
      message: error.message || "카테고리 간편옵션 조회에 실패했습니다.",
    });
  }
});

// 네이버 카테고리별 속성 조회
app.post("/NsearchAttribute", async (req, res) => {

  const categoryCode = req.body.categoryCode;;

  // 계정 API Key 조회
  let accData = req.body.accName;

  await db
    .collection("Accounts")
    .doc(req.body.accName)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        throw new Error("ACC 데이터 조회 실패");
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      throw new Error("ACC 데이터 조회 실패");
    });

  const n_id = accData.n_id; // app ID
  const n_sk = accData.n_sk; // Secret Key

  const accessToken = await getAccessToken(n_id, n_sk, "SELF");
  const category = await NsearchCategory(categoryCode, accessToken.access_token);
  const exceptionalCategories = Array.isArray(category?.exceptionalCategories)
    ? category.exceptionalCategories
    : [];
  const isUnitPriceCategory = exceptionalCategories.includes("UNIT_PRICE");
  const recommendedUnitPriceGuide = await getRecommendedUnitPriceGuide(
    categoryCode,
    accessToken.access_token
  );

  const attributesWithValues = await getAttributesWithValues(categoryCode, accessToken.access_token);

  res.json({
    attributes: attributesWithValues,
    exceptionalCategories,
    isUnitPriceCategory,
    unitPriceValue: recommendedUnitPriceGuide.unitPriceValue,
    unitPriceText: recommendedUnitPriceGuide.unitPriceText,
  });

  console.log("[Naver][NsearchAttribute] unit price defaults", {
    categoryCode,
    isUnitPriceCategory,
    unitPriceValue: recommendedUnitPriceGuide.unitPriceValue,
    unitPriceText: recommendedUnitPriceGuide.unitPriceText,
  });

  // 카테고리별 속성, 속성 값 조회 / 매칭 함수
  async function getAttributesWithValues(categoryCode, accessToken) {
    try {
      // 속성 목록 조회 API 호출
      const attributesResponse = await fetch(
        `https://api.commerce.naver.com/external/v1/product-attributes/attributes?categoryId=${categoryCode}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (attributesResponse.ok) {
        const attributes = await attributesResponse.json();

        // attributeType이 'PRIMARY'인 속성들만 필터링
        const primaryAttributes = attributes.filter(
          (attribute) => attribute.attributeType === "PRIMARY"
        );

        // 속성 값 조회 API 호출
        const valuesResponse = await fetch(
          `https://api.commerce.naver.com/external/v1/product-attributes/attribute-values?categoryId=${categoryCode}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (valuesResponse.ok) {
          const allValues = await valuesResponse.json();

          // 속성값 단위 조회 API 호출
          const unitCodeResponse = await fetch(
            'https://api.commerce.naver.com/external/v1/product-attributes/attribute-value-units',
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if(unitCodeResponse.ok) {
            const unitCodes = await unitCodeResponse.json();
            // 각 속성에 대해 값 찾아서 values 객체 추가
            for (const attribute of primaryAttributes) {
              const attributeValues = allValues.filter(
                (value) => value.attributeSeq === attribute.attributeSeq
              );

              const unit = unitCodes.find(unit => unit.id === attribute.representativeUnitCode);
              attribute.representativeUnitCodeName = unit ? unit.unitCodeName : '';
              attribute.values = attributeValues;
            }

            // 결과 반환
            return primaryAttributes;
          }

        } else {
          console.error("속성 값 조회 실패");
          return primaryAttributes;
        }
      } else {
        console.error("속성 목록 조회 실패");

        return [];
      }
    } catch (error) {
      console.error("API 요청 에러:", error);
      return [];
    }
  }
});

function normalizeNaverSizeTypeList(payload) {
  const source = payload?.data ?? payload;
  const candidates = [
    source?.contents,
    source?.content,
    source?.sizeTypes,
    source?.list,
    Array.isArray(source) ? source : null,
  ];

  const sizeTypes = [];
  candidates.forEach((candidate) => {
    if (Array.isArray(candidate)) sizeTypes.push(...candidate);
  });

  return sizeTypes;
}

async function fetchNaverJson(url, accessToken) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const text = await response.text();
  let body = {};

  try {
    body = text ? JSON.parse(text) : {};
  } catch (error) {
    body = { message: text };
  }

  if (!response.ok) {
    const message =
      body?.message || body?.error?.message || text || `네이버 API 요청 실패(${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

app.post("/NsearchSizeTypes", async (req, res) => {
  console.log("네이버 사이즈 타입 전체 조회");

  try {
    const accData = await getNaverAccount(req.body.accName);
    const accessToken = await getAccessToken(accData.n_id, accData.n_sk, "SELF");

    const response = await fetch(
      "https://api.commerce.naver.com/external/v1/product-sizes",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseBody = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(responseBody);
    }

    return res.json(responseBody);
  } catch (error) {
    console.error("네이버 사이즈 타입 조회 실패:", error);
    return res.status(500).json({
      result: "error",
      message: error.message || "사이즈 타입 조회 실패",
    });
  }
});

app.post("/NsearchSizeTypeDetail", async (req, res) => {
  console.log("네이버 사이즈 타입 상세 조회");

  try {
    const sizeTypeId = req.body.sizeTypeId;
    if (!sizeTypeId) {
      return res.status(400).json({
        result: "error",
        message: "사이즈 타입 번호가 필요합니다.",
      });
    }

    const accData = await getNaverAccount(req.body.accName);
    const accessToken = await getAccessToken(accData.n_id, accData.n_sk, "SELF");

    const response = await fetch(
      `https://api.commerce.naver.com/external/v1/product-sizes/${sizeTypeId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseBody = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(responseBody);
    }

    return res.json(responseBody);
  } catch (error) {
    console.error("네이버 사이즈 타입 상세 조회 실패:", error);
    return res.status(500).json({
      result: "error",
      message: error.message || "사이즈 타입 상세 조회 실패",
    });
  }
});

app.post("/NsearchAllSizeValues", async (req, res) => {
  console.log("네이버 전체 사이즈 참고값 조회");

  try {
    const accData = await getNaverAccount(req.body.accName);
    const accessToken = await getAccessToken(accData.n_id, accData.n_sk, "SELF");

    const sizeTypesResponse = await fetchNaverJson(
      "https://api.commerce.naver.com/external/v1/product-sizes",
      accessToken.access_token
    );
    const sizeTypes = normalizeNaverSizeTypeList(sizeTypesResponse);

    return res.json({
      result: "success",
      sizeTypes,
    });
  } catch (error) {
    console.error("네이버 전체 사이즈 참고값 조회 실패:", error);
    return res.status(500).json({
      result: "error",
      message: error.message || "전체 사이즈 참고값 조회 실패",
    });
  }
});

app.post("/NgetSizeRegistrationProgress", async (req, res) => {
  try {
    const requestId = String(req.body.registrationRequestId || "");
    if (!req.body.accName || !requestId) {
      return res.status(400).json({
        result: "error",
        message: "계정명과 상품 등록 요청 번호가 필요합니다.",
      });
    }

    const snapshot = await getNaverSizeRegistrationLockRef(req.body.accName).get();
    if (!snapshot.exists) {
      return res.json({ status: "waiting", completed: 0, total: 0, success: 0, failed: 0 });
    }

    const lock = snapshot.data();
    const matchesCurrentRequest = lock.currentRequestId === requestId;
    const matchesCompletedRequest = lock.lastCompletedRequestId === requestId;
    if (!matchesCurrentRequest && !matchesCompletedRequest) {
      return res.json({ status: "waiting", completed: 0, total: 0, success: 0, failed: 0 });
    }

    return res.json(lock.progress || {
      status: matchesCompletedRequest ? "completed" : "preparing",
      completed: 0,
      total: 0,
      success: 0,
      failed: 0,
    });
  } catch (error) {
    console.error("네이버 옵션별 상품등록 진행 상태 조회 실패:", error);
    return res.status(500).json({
      result: "error",
      message: error.message || "상품 등록 진행 상태 조회에 실패했습니다.",
    });
  }
});

app.post("/NaddSizeIndividualProducts", async (req, res) => {
  console.log("네이버 사이즈 간편옵션 상품등록");

  const registrationStartedAt = Date.now();
  const registrationDeadlineAt = registrationStartedAt + NAVER_SIZE_REGISTRATION_BUDGET_MS;
  let registrationLockRef = null;
  let registrationLockRequestId = null;
  let registrationLockClaimed = false;

  try {
    const reqData = req.body.productData;
    const withoutColor = reqData?.colorOption?.withoutColor === true;

    if (!reqData?.product?.name) {
      return res.status(400).json({
        result: "error",
        message: "상품명이 필요합니다.",
      });
    }

    if (!Array.isArray(reqData?.sizeOption?.sizes) || reqData.sizeOption.sizes.length === 0) {
      return res.status(400).json({
        result: "error",
        message: "등록할 사이즈가 없습니다.",
      });
    }

    if (
      !withoutColor &&
      (!Array.isArray(reqData?.colorOption?.colors) || reqData.colorOption.colors.length === 0)
    ) {
      return res.status(400).json({
        result: "error",
        message: "등록할 색상이 없습니다.",
      });
    }

    if (!Array.isArray(reqData?.optionCombinations) || reqData.optionCombinations.length === 0) {
      return res.status(400).json({
        result: "error",
        message: "등록할 옵션이 없습니다.",
      });
    }

    if (reqData.optionCombinations.length > 500) {
      return res.status(400).json({
        result: "error",
        message: "옵션은 최대 500개까지 등록할 수 있습니다.",
      });
    }

    if (!Array.isArray(reqData?.product?.additionalImages) || reqData.product.additionalImages.length === 0) {
      return res.status(400).json({
        result: "error",
        message: "상품 이미지가 필요합니다.",
      });
    }

    if (!Array.isArray(reqData?.detailImages) || reqData.detailImages.length === 0) {
      return res.status(400).json({
        result: "error",
        message: "상세 이미지가 필요합니다.",
      });
    }

    registrationLockRequestId = String(
      req.body.registrationRequestId || crypto.randomUUID()
    );
    if (registrationLockRequestId.length > 100) {
      return res.status(400).json({
        result: "error",
        message: "잘못된 상품 등록 요청 번호입니다.",
      });
    }

    const registrationClaim = await claimNaverSizeRegistration(
      req.body.accName,
      registrationLockRequestId
    );
    if (registrationClaim.status === "completed") {
      return res.json({
        ...registrationClaim.response,
        duplicateRequest: true,
      });
    }
    if (registrationClaim.status === "busy") {
      return res.status(409).json({
        result: "error",
        code: "REGISTRATION_IN_PROGRESS",
        message: "같은 네이버 계정에서 상품을 등록 중입니다. 완료 후 다시 시도해주세요.",
      });
    }

    registrationLockRef = registrationClaim.lockRef;
    registrationLockClaimed = true;

    await updateNaverSizeRegistrationProgress(
      registrationLockRef,
      registrationLockRequestId,
      {
        status: "uploading-images",
        completed: 0,
        total: reqData.optionCombinations.length,
        success: 0,
        failed: 0,
        currentOptionLabel: "",
      }
    );

    const accData = await getNaverAccount(req.body.accName);
    const n_id = accData.n_id;
    const n_sk = accData.n_sk;

    const accessToken = await getAccessToken(n_id, n_sk, "SELF");
    const sellerTags = Array.isArray(reqData.tags) ? reqData.tags : [];
    await saveKeywords(reqData.category.id, sellerTags);

    const category = await NsearchCategory(reqData.category.id, accessToken.access_token);
    const exceptionalCategories = Array.isArray(category?.exceptionalCategories)
      ? category.exceptionalCategories
      : [];

    const uploadedDescImages = await NuploadProductImages(
      accessToken.access_token,
      Object.values(reqData.detailImages)
    );
    const detailImageUrls = uploadedDescImages.images.map((image) => image.url);

    const imageFiles = reqData.product.additionalImages.map((image) => image.file);
    const uploadedImages = await NuploadProductImages(
      accessToken.access_token,
      Object.values(imageFiles)
    );

    if (!uploadedImages?.images?.length) {
      throw new Error("상품 이미지 업로드 결과가 없습니다.");
    }

    const providedNoticeType = reqData.providedNotice.productInfoProvidedNoticeType;
    const noticeKey = getNoticeTypeString(providedNoticeType);
    const product = reqData.product;
    const regularPrice = parseInt(product.regularPrice, 10);
    const salePrice = parseInt(product.price, 10);

    if (!Number.isFinite(regularPrice) || !Number.isFinite(salePrice)) {
      return res.status(400).json({
        result: "error",
        message: "정상가와 판매가를 숫자로 입력해주세요.",
      });
    }

    const sizeRows = reqData.sizeOption.sizes
      .filter((size) => size && size.usable !== false && size.label)
      .map((size) => ({
        label: String(size.label).trim(),
        value: size.value,
        measurementValue: size.measurementValue,
      }));

    const colorRows = (Array.isArray(reqData?.colorOption?.colors) ? reqData.colorOption.colors : [])
      .filter((color) => color && color.label)
      .map((color) => ({ label: String(color.label).trim() }));

    if (sizeRows.length === 0 || (!withoutColor && colorRows.length === 0)) {
      throw new Error("등록 가능한 옵션이 없습니다.");
    }

    const productName = String(product.name).trim();
    const colorLabels = colorRows.map((color) => color.label);
    const sizeLabels = sizeRows.map((size) => String(size.label).trim());
    const findDuplicateOption = (labels) => {
      const normalized = labels.map((label) => normalizeOptionText(label));
      const duplicateIndex = normalized.findIndex((label, index) => normalized.indexOf(label) !== index);
      return duplicateIndex >= 0 ? labels[duplicateIndex] : null;
    };
    const duplicateColor = findDuplicateOption(colorLabels);
    const duplicateSize = findDuplicateOption(sizeLabels);

    if (duplicateColor) {
      return res.status(400).json({
        result: "error",
        message: `중복된 색상 옵션이 있습니다: ${duplicateColor}`,
      });
    }

    if (duplicateSize) {
      return res.status(400).json({
        result: "error",
        message: `중복된 사이즈 옵션이 있습니다: ${duplicateSize}`,
      });
    }

    const colorLabelMap = new Map(
      colorRows.map((color) => [normalizeOptionText(color.label), color.label])
    );
    const sizeLabelMap = new Map(
      sizeRows.map((size) => [normalizeOptionText(size.label), size.label])
    );
    const combinationKeys = new Set();
    const selectedCombinations = reqData.optionCombinations.map((combination) => {
      const size = sizeLabelMap.get(normalizeOptionText(combination?.size));

      if (withoutColor) {
        if (!size) {
          throw new Error("사이즈 옵션 목록에 없는 값이 포함되어 있습니다.");
        }

        const key = normalizeOptionText(size);
        if (combinationKeys.has(key)) {
          throw new Error(`중복된 사이즈 옵션이 있습니다: ${size}`);
        }
        combinationKeys.add(key);
        return { size };
      }

      const color = colorLabelMap.get(normalizeOptionText(combination?.color));
      if (!color || !size) {
        throw new Error("색상/사이즈 조합에 옵션 목록에 없는 값이 포함되어 있습니다.");
      }

      const key = `${normalizeOptionText(color)}:${normalizeOptionText(size)}`;
      if (combinationKeys.has(key)) {
        throw new Error(`중복된 색상/사이즈 조합이 있습니다: ${color} / ${size}`);
      }
      combinationKeys.add(key);
      return { color, size };
    });

    const usedColorKeys = new Set(
      selectedCombinations.map((combination) => normalizeOptionText(combination.color))
    );
    const usedSizeKeys = new Set(
      selectedCombinations.map((combination) => normalizeOptionText(combination.size))
    );
    const usedColorRows = colorRows.filter((color) =>
      usedColorKeys.has(normalizeOptionText(color.label))
    );
    const usedSizeRows = sizeRows.filter((size) =>
      usedSizeKeys.has(normalizeOptionText(size.label))
    );

    const optionProductNames = selectedCombinations.map((combination) =>
      buildSizeRegistrationProductName(productName, combination, withoutColor)
    );
    const overLengthProductName = optionProductNames.find((name) => name.length > 100);

    if (overLengthProductName) {
      return res.status(400).json({
        result: "error",
        message: `상품명이 100자를 초과합니다: ${overLengthProductName}`,
      });
    }

    if (regularPrice <= 0 || salePrice <= 0) {
      return res.status(400).json({
        result: "error",
        message: "등록 가격이 0원 이하입니다.",
      });
    }

    const detailContent = detailImageUrls
      .map((imageUrl) => `<div style="text-align: center;"><img src="${imageUrl}"></div>`)
      .join("");

    const images = {
      representativeImage: {
        url: uploadedImages.images[0].url,
      },
      optionalImages: uploadedImages.images
        .slice(1)
        .map((image) => ({ url: image.url })),
    };

    const createProductAttributes = () => {
      const productAttributes = [];

      for (const attribute of reqData.selectedProductAttributes || []) {
        if (attribute.attributeClassificationType === "RANGE" && attribute.selectedValue) {
          productAttributes.push({
            attributeSeq: parseInt(attribute.attributeSeq, 10),
            attributeValueSeq: parseInt(attribute.selectedValue.rangeValue, 10),
            attributeRealValue: Number(attribute.selectedValue.attributeRealValue),
            attributeRealValueUnitCode: attribute.representativeUnitCode,
          });
        } else if (attribute.attributeClassificationType === "MULTI_SELECT" && Array.isArray(attribute.selectedValues)) {
          attribute.selectedValues.forEach((value) => {
            productAttributes.push({
              attributeSeq: parseInt(attribute.attributeSeq, 10),
              attributeValueSeq: value,
            });
          });
        } else if (attribute.attributeClassificationType === "SINGLE_SELECT" && attribute.selectedValue) {
          productAttributes.push({
            attributeSeq: parseInt(attribute.attributeSeq, 10),
            attributeValueSeq: parseInt(attribute.selectedValue, 10),
          });
        }
      }

      return productAttributes;
    };

    const createCertificationTargetExcludeContent = () => {
      const certificationTargetExcludeContent = {};

      if (exceptionalCategories.includes("KC_CERTIFICATION")) {
        certificationTargetExcludeContent.kcCertifiedProductExclusionYn = "TRUE";
      }
      if (exceptionalCategories.includes("GREEN_PRODUCTS")) {
        certificationTargetExcludeContent.greenCertifiedProductExclusionYn = true;
      }
      if (exceptionalCategories.includes("CHILD_CERTIFICATION")) {
        certificationTargetExcludeContent.childCertifiedProductExclusionYn = true;
      }

      return certificationTargetExcludeContent;
    };

    const discountValue = regularPrice - salePrice;
    const stockQuantity = 9999999;

    const sizeTypeNo = parseInt(reqData.productSize?.sizeTypeNo, 10);
    const sizeValueTypeNo = parseInt(reqData.productSize?.sizeValueTypeNo, 10);
    const standardOptionGroups = withoutColor
      ? []
      : await getStandardOptionGroups(reqData.category.id, accessToken.access_token);
    const registeredProducts = [];
    const failedProducts = [];

    await updateNaverSizeRegistrationProgress(
      registrationLockRef,
      registrationLockRequestId,
      {
        status: "registering",
        completed: 0,
        total: selectedCombinations.length,
        success: 0,
        failed: 0,
        currentOptionLabel: "",
      }
    );

    for (let index = 0; index < selectedCombinations.length; index += 1) {
      if (Date.now() >= registrationDeadlineAt) {
        selectedCombinations.slice(index).forEach((skippedCombination) => {
          const skippedOptionLabel = withoutColor
            ? skippedCombination.size
            : `${skippedCombination.color} / ${skippedCombination.size}`;
          failedProducts.push({
            productName: buildSizeRegistrationProductName(
              productName,
              skippedCombination,
              withoutColor
            ),
            baseProductName: productName,
            option: skippedCombination,
            optionLabel: skippedOptionLabel,
            message: "서버 제한 시간 보호를 위해 등록하지 않았습니다.",
          });
        });
        break;
      }

      const combination = selectedCombinations[index];
      const combinationKey = getSizeRegistrationCombinationKey(combination, withoutColor);
      const orderedCombinations = [
        combination,
        ...selectedCombinations.filter(
          (optionCombination) =>
            getSizeRegistrationCombinationKey(optionCombination, withoutColor) !== combinationKey
        ),
      ];
      const orderedSizeKeys = new Set(
        orderedCombinations.map((optionCombination) => normalizeOptionText(optionCombination.size))
      );
      const orderedColorKeys = new Set(
        orderedCombinations.map((optionCombination) => normalizeOptionText(optionCombination.color))
      );
      const currentSizeRows = usedSizeRows.filter(
        (size) => normalizeOptionText(size.label) === normalizeOptionText(combination.size)
      );
      const orderedSizeRows = usedSizeRows.filter((size) =>
        orderedSizeKeys.has(normalizeOptionText(size.label))
      );
      const combinationColorRows = withoutColor
        ? []
        : usedColorRows.filter((color) => orderedColorKeys.has(normalizeOptionText(color.label)));
      let optionInfo;
      let optionMode;
      let fallbackOptionInfo = null;

      if (withoutColor) {
        optionInfo = buildCombinationSizeOptionInfo(orderedCombinations, stockQuantity);
        optionMode = "size-only-combination";
      } else {
        const standardOptionInfo = buildStandardColorSizeOptionInfo(
          combinationColorRows,
          orderedSizeRows,
          orderedCombinations,
          standardOptionGroups,
          stockQuantity
        );
        optionInfo =
          standardOptionInfo || buildCombinationColorSizeOptionInfo(orderedCombinations, stockQuantity);
        optionMode = standardOptionInfo ? "standard" : "combination";
        if (standardOptionInfo) {
          fallbackOptionInfo = buildCombinationColorSizeOptionInfo(orderedCombinations, stockQuantity);
        }
      }
      const registeredProductName = optionProductNames[index];

      const detailAttribute = {
        naverShoppingSearchInfo: {
          manufacturerName: reqData.commonInfo?.manufacture || "",
          brandName: reqData.commonInfo?.brand || "",
        },
        afterServiceInfo: {
          afterServiceTelephoneNumber: reqData.asInfo?.asNumber || "070-7954-3996",
          afterServiceGuideContent: reqData.asInfo?.asDescription || "톡톡으로 문의주세요",
        },
        purchaseQuantityInfo: {
          maxPurchaseQuantityPerOrder: 1,
          maxPurchaseQuantityPerId: 1000000,
        },
        originAreaInfo: {
          originAreaCode: "03",
        },
        minorPurchasable: true,
        optionInfo,
        productInfoProvidedNotice: {
          productInfoProvidedNoticeType: providedNoticeType,
          [noticeKey]: getNoti(providedNoticeType),
        },
        productAttributes: createProductAttributes(),
        productCertificationInfos: null,
        certificationTargetExcludeContent: createCertificationTargetExcludeContent(),
        seoInfo: {
          sellerTags: sellerTags.map((tag) => ({ text: tag })),
        },
      };

      const productSizeAttributes = currentSizeRows
        .map((size) => ({
          name: String(size.label),
          value: Number(size.measurementValue),
        }))
        .filter((size) => Number.isFinite(size.value));

      if (
        Number.isFinite(sizeTypeNo) &&
        Number.isFinite(sizeValueTypeNo) &&
        productSizeAttributes.length > 0
      ) {
        detailAttribute.productSize = {
          sizeTypeNo,
          sizeAttributes: productSizeAttributes.map((size) => ({
            name: size.name,
            sizeValues: [
              {
                sizeValueTypeNo,
                value: size.value,
              },
            ],
          })),
        };
      }

      const requestData = {
        originProduct: {
          statusType: "SALE",
          saleType: "NEW",
          leafCategoryId: reqData.category.id,
          name: registeredProductName,
          detailContent,
          images,
          saleStartDate: new Date().toISOString(),
          saleEndDate: new Date("2099-12-31").toISOString(),
          salePrice: regularPrice,
          stockQuantity,
          deliveryInfo: reqData.deliveryInfo,
          detailAttribute,
        },
        smartstoreChannelProduct: {
          channelProductName: registeredProductName,
          naverShoppingRegistration: true,
          channelProductDisplayStatusType: "ON",
        },
      };

      if (discountValue > 0) {
        requestData.originProduct.customerBenefit = {
          immediateDiscountPolicy: {
            discountMethod: {
              value: discountValue,
              unitType: "WON",
            },
          },
        };
      }

      const optionLabel = withoutColor
        ? combination.size
        : `${combination.color} / ${combination.size}`;

      await updateNaverSizeRegistrationProgress(
        registrationLockRef,
        registrationLockRequestId,
        {
          status: "registering",
          completed: index,
          total: selectedCombinations.length,
          success: registeredProducts.length,
          failed: failedProducts.length,
          currentOptionLabel: optionLabel,
        }
      );

      try {
        let responseData;
        let registeredOptionMode = optionMode;

        try {
          responseData = await registerNaverProductWithRetry(
            requestData,
            accessToken.access_token,
            3,
            registrationDeadlineAt
          );
        } catch (registrationError) {
          if (!fallbackOptionInfo) throw registrationError;

          console.error(
            "네이버 표준옵션 상품등록 실패, 조합형 옵션으로 재시도:",
            optionLabel,
            registrationError
          );
          requestData.originProduct.detailAttribute.optionInfo = fallbackOptionInfo;
          responseData = await registerNaverProductWithRetry(
            requestData,
            accessToken.access_token,
            3,
            registrationDeadlineAt
          );
          registeredOptionMode = "combination-fallback";
        }

        registeredProducts.push({
          productName: registeredProductName,
          baseProductName: productName,
          option: combination,
          optionLabel,
          optionMode: registeredOptionMode,
          response: responseData,
        });
      } catch (registrationError) {
        console.error("네이버 옵션별 상품등록 실패:", optionLabel, registrationError);
        failedProducts.push({
          productName: registeredProductName,
          baseProductName: productName,
          option: combination,
          optionLabel,
          message: registrationError.message || "네이버 상품 등록 실패",
        });
      }

      await updateNaverSizeRegistrationProgress(
        registrationLockRef,
        registrationLockRequestId,
        {
          status: "registering",
          completed: index + 1,
          total: selectedCombinations.length,
          success: registeredProducts.length,
          failed: failedProducts.length,
          currentOptionLabel: optionLabel,
        }
      );

      if (index < selectedCombinations.length - 1) {
        if (Date.now() + 700 >= registrationDeadlineAt) continue;
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }

    const responsePayload = {
      result:
        failedProducts.length === 0
          ? "success"
          : registeredProducts.length > 0
            ? "partial"
            : "error",
      message:
        failedProducts.length === 0
          ? `${productName} 옵션별 상품 ${registeredProducts.length}개가 등록되었습니다.`
          : `${productName} 옵션별 상품 ${registeredProducts.length}개 등록, ${failedProducts.length}개 실패했습니다.`,
      registeredCount: registeredProducts.length,
      optionCount: selectedCombinations.length,
      failedCount: failedProducts.length,
      registeredProducts,
      failedProducts,
    };

    await updateNaverSizeRegistrationProgress(
      registrationLockRef,
      registrationLockRequestId,
      {
        status: failedProducts.length === 0 ? "completed" : "completed-with-errors",
        completed: selectedCombinations.length,
        total: selectedCombinations.length,
        success: registeredProducts.length,
        failed: failedProducts.length,
        currentOptionLabel: "",
      }
    );

    await completeNaverSizeRegistration(
      registrationLockRef,
      registrationLockRequestId,
      responsePayload
    );
    registrationLockClaimed = false;

    return res.status(registeredProducts.length === 0 ? 502 : 200).json(responsePayload);
  } catch (error) {
    console.error("네이버 사이즈 간편옵션 상품등록 오류:", error);
    if (registrationLockClaimed && registrationLockRef && registrationLockRequestId) {
      try {
        await updateNaverSizeRegistrationProgress(
          registrationLockRef,
          registrationLockRequestId,
          {
            status: "error",
            message: error.message || "상품 등록 중 오류가 발생했습니다.",
          }
        );
      } catch (progressError) {
        console.error("네이버 옵션별 상품등록 오류 상태 저장 실패:", progressError);
      }
    }
    return res.status(500).json({
      result: "error",
      message: error.message || "사이즈 간편옵션 상품 등록 중 오류가 발생했습니다.",
    });
  } finally {
    if (registrationLockClaimed && registrationLockRef && registrationLockRequestId) {
      try {
        await releaseNaverSizeRegistration(
          registrationLockRef,
          registrationLockRequestId
        );
      } catch (releaseError) {
        console.error("네이버 사이즈 상품 등록 잠금 해제 실패:", releaseError);
      }
    }
  }
});

// 네이버 상품등록 API
app.post("/NaddProducts", async (req, res) => {
  console.log("네이버 상품등록");
  // 계정 API Key 조회
  let accData;
  await db
    .collection("Accounts")
    .doc(req.body.accName)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
        throw new Error("ACC 데이터 조회 실패");
      } else {
        accData = doc.data();
        console.log("계정명:", doc.id);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
      throw new Error("ACC 데이터 조회 실패");
    });

  const n_id = accData.n_id; // app ID
  const n_sk = accData.n_sk; // Secret Key

  // 요청 데이터
  const reqData = req.body.productData;
  const descImageFiles = reqData.detailImages;

  // 액세스 토큰 발급받기
  const accessToken = await getAccessToken(n_id, n_sk, "SELF");

  const results = [];

  // 키워드 태그 배열 변환
  const sellerTags = reqData.tags;

  // 카테고리별 키워드 저장
  saveKeywords(
    reqData.category.id,
    sellerTags
  );
  
  const category = await NsearchCategory(reqData.category.id, accessToken.access_token);
  const isUnitPriceCategory = Array.isArray(category?.exceptionalCategories) &&
    category.exceptionalCategories.includes("UNIT_PRICE");
  let productCertificationInfos = [];
  let certificationTargetExcludeContent = {};
  if(category.exceptionalCategories.length > 0) {
    category.exceptionalCategories.forEach(exceptionalCategory => {
      if(exceptionalCategory === "GREEN_PRODUCTS") {
        let isrtGreen = false;
        category.certificationInfos.forEach(info => {
          let isGreen = false;
          info.kindTypes.forEach(item => {
            if(!isGreen && item === "GREEN_PRODUCTS") {
              isGreen = true;
            }
          });
          if(isGreen) {
            if(!isrtGreen) {
              productCertificationInfos.push({
                certificationInfoId : info.id,
                certificationKindType : "GREEN_PRODUCTS"
              });
              isrtGreen = true;
            }
          }
        });
        certificationTargetExcludeContent.greenCertifiedProductExclusionYn = true;
      }
      if(exceptionalCategory === "KC_CERTIFICATION") {
        let isrtKc = false;
        category.certificationInfos.forEach(info => {
          let isKc = false;
          info.kindTypes.forEach(item => {
            if(!isKc && item === "KC_CERTIFICATION") {
              isKc = true;
            }
          });
          if(isKc) {
            if(!isrtKc) {
              productCertificationInfos.push({
                certificationInfoId : info.id,
                certificationKindType : "KC_CERTIFICATION"
              });
              isrtKc = true;
            }
          }
        });
        certificationTargetExcludeContent.kcCertifiedProductExclusionYn = "TRUE";
      }
      if(exceptionalCategory === "CHILD_CERTIFICATION") {
        let isrtChild = false;
        category.certificationInfos.forEach(info => {
          let isChildCert = false;
          info.kindTypes.forEach(item => {
            if(!isChildCert && item === "CHILD_CERTIFICATION") {
              isChildCert = true;
            }
          });
            if(isChildCert) {
                if(!isrtChild) {
                    productCertificationInfos.push({
                    certificationInfoId : info.id,
                    certificationKindType : "CHILD_CERTIFICATION"
                });
                    isrtChild = true;
                }
            }
        });
        certificationTargetExcludeContent.childCertifiedProductExclusionYn = true;
      }
    });
  }

  // 상품 루프
  const products = reqData.products;
  const mainProduct = reqData.mainProduct;

  const supplementProducts = mainProduct.options[0].values.length > 1 ? mainProduct.options[0].values.map((value) => {
    return {
      groupName: "곧 세일 끝 하나 더!",
      name: value.value,
      price: parseInt(mainProduct.price),
      stockQuantity: 9999999,
    };
  }) : [{
    groupName: "곧 세일 끝 하나 더!",
    name: mainProduct.options[0].name,
    price: parseInt(mainProduct.price),
    stockQuantity: 9999999,
  }];

//   const modifiedProducts = products.map(product => ({
//     ...product,
//     name: `${product.name} 샘플증여`, 
//     price: parseInt(product.price) + 1000, // 가격에 1000원 추가
//     regularPrice: parseInt(product.regularPrice) + 1300, // 가격에 1000원 추가
//   }));
//   const combinedProducts = [...products, ...modifiedProducts];

//   for (const product of combinedProducts) {
for (const product of products) {

    // 상품명이 없으면 스킵
    if (!product.name) {
      console.log("상품명이 없습니다.");
      continue;
    }

    let requestData = {};

    console.log("상세페이지 이미지 다건 업로드 실행");
    const uploadedDescImages = await NuploadProductImages(
      accessToken.access_token,
      Object.values(descImageFiles)
    );

    const detailImageUrls = await uploadedDescImages.images.map(
      (image) => image.url
    );

    try {
      // 이미지 업로드
      const imageFiles = product.additionalImages.map(image => image.file);
      const uploadedImages = await NuploadProductImages(
        accessToken.access_token,
        Object.values(imageFiles)
      );
      const noticeKey = getNoticeTypeString(reqData.providedNotice.productInfoProvidedNoticeType);

      // JSON 타입 데이터 구성
      requestData = {
        originProduct: {
          statusType: "SALE",
          saleType: "NEW",
          leafCategoryId:
            reqData.category.id,
          name: product.name,
          detailContent: detailImageUrls
            .map(
              (imageUrl) =>
                `<div style="text-align: center;"><img src="${imageUrl}"></div>`
            )
            .join(""),
          images: {
            representativeImage: {
              url: uploadedImages.images[0].url,
            },
            optionalImages: uploadedImages.images
              .slice(1)
              .map((image) => ({ url: image.url })),
          },
          saleStartDate: new Date().toISOString(),
          saleEndDate: new Date("2099-12-31").toISOString(),
          salePrice: parseInt(product.regularPrice), // 정상가
          stockQuantity: 9999999,
          deliveryInfo: reqData.deliveryInfo,
          detailAttribute: {
            supplementProductInfo: {
              supplementProducts: supplementProducts
            },
            naverShoppingSearchInfo: {
              manufacturerName: reqData.commonInfo.manufacture, // 제조사
              brandName: reqData.commonInfo.brand, // 브랜드
            },
            afterServiceInfo: {
              afterServiceTelephoneNumber: reqData.asInfo.asNumber, // A/S 전화번호
              afterServiceGuideContent: reqData.asInfo.asDescription, // A/S 안내
            },
            purchaseQuantityInfo: {
              maxPurchaseQuantityPerOrder: 1, // 1회 최대 구매
              maxPurchaseQuantityPerId: 1000000, // 1인 최대 구매
            },
            originAreaInfo: {
              originAreaCode: "03", // ** 원산지 상세 지역 코드
            },
            optionInfo: {
              // 옵션정보 (필수)
              optionSimple: product.options[0].values.map((val) => {
                return {
                  groupName: product.options[0].name, // 옵션명
                  name: val.value, // 옵션값
                };
              })
            },
            minorPurchasable: true, // 미성년자 구매 가능
            productInfoProvidedNotice: {
              productInfoProvidedNoticeType: reqData.providedNotice.productInfoProvidedNoticeType, // 상품정보제공고시
              [noticeKey] : getNoti(reqData.providedNotice.productInfoProvidedNoticeType), // 상품정보제공고시
            },
            productAttributes: [], // ** 상품 속성 목록 (모든 PRIMARY 필수인지 확인 필요)
            productCertificationInfos: null,
            certificationTargetExcludeContent: {},
            seoInfo: {
              sellerTags: sellerTags.map(tag => ({text : tag})), // 판매자 태그
            },
          },
          customerBenefit: {
            immediateDiscountPolicy: {
              // 판매자 즉시 할인
              discountMethod: {
                value:
                  parseInt(product.regularPrice) -
                  parseInt(product.price), // 할인 값 (정상가 - 할인가)
                unitType: "WON", // 정액할인
              },
            },
          },
        },
        smartstoreChannelProduct: {
          // 스마트스토어 채널상품 정보
          channelProductName: product.name, // 전용 상품명
          naverShoppingRegistration: true, // 네이버 쇼핑 등록 여부
          channelProductDisplayStatusType: "ON", // 전시상태
        },
      };

      if(productCertificationInfos.length > 0) {
        // requestData.originProduct.detailAttribute.productCertificationInfos = productCertificationInfos;
        requestData.originProduct.detailAttribute.certificationTargetExcludeContent = certificationTargetExcludeContent;
      }

      const unitCapacityInfo = normalizeUnitCapacityInfo(product.unitCapacityInfo);
      const shouldIncludeUnitCapacity = isUnitPriceCategory || unitCapacityInfo.unitPriceYn;

      if (shouldIncludeUnitCapacity) {
        if (!unitCapacityInfo.unitPriceYn) {
          if (isUnitPriceCategory) {
            throw new Error(`${product.name} 단위가격 입력이 필요합니다.`);
          }
        } else {
          const totalCapacityValueText = String(unitCapacityInfo.totalCapacityValue).trim();
          const unitCapacityText = String(unitCapacityInfo.unitCapacity).trim();

          if (!/^\d+(\.\d{1,3})?$/.test(totalCapacityValueText)) {
            throw new Error(`${product.name} 총용량 형식이 올바르지 않습니다.`);
          }

          const totalCapacityValue = Number(totalCapacityValueText);
          if (!Number.isFinite(totalCapacityValue) || totalCapacityValue < 0.001 || totalCapacityValue > 999999999) {
            throw new Error(`${product.name} 총용량 범위가 올바르지 않습니다.`);
          }

          if (!/^\d+$/.test(unitCapacityText)) {
            throw new Error(`${product.name} 표시용량은 1부터 999 사이의 정수여야 합니다.`);
          }

          const unitCapacity = Number(unitCapacityText);
          if (!Number.isInteger(unitCapacity) || unitCapacity < 1 || unitCapacity > 999) {
            throw new Error(`${product.name} 표시용량은 1부터 999 사이의 정수여야 합니다.`);
          }

          if (!UNIT_PRICE_INDICATION_UNITS.has(unitCapacityInfo.indicationUnit)) {
            throw new Error(`${product.name} 표시단위가 올바르지 않습니다.`);
          }

          requestData.originProduct.detailAttribute.unitCapacity = {
            unitPriceYn: true,
            totalCapacityValue,
            unitCapacity,
            indicationUnit: unitCapacityInfo.indicationUnit,
          };
        }
      }

      // 속성 정보 설정 추가
      for (const attribute of reqData.selectedProductAttributes) {
        if (attribute.attributeClassificationType === "RANGE") {
          const productAttribute = {
            attributeSeq: attribute.attributeSeq,
            attributeValueSeq: parseInt(attribute.selectedValue.rangeValue),
            attributeRealValue: parseInt(attribute.selectedValue.attributeRealValue),
            attributeRealValueUnitCode: attribute.representativeUnitCode,
          };
          requestData.originProduct.detailAttribute.productAttributes.push(
            productAttribute
          );
        } else if (attribute.attributeClassificationType === "MULTI_SELECT") {
          attribute.selectedValues.forEach((value) => {
            const productAttribute = {
              attributeSeq: parseInt(attribute.attributeSeq),
              attributeValueSeq: value,
            };
            requestData.originProduct.detailAttribute.productAttributes.push(
              productAttribute
            );
          });
        } else if (attribute.attributeClassificationType === "SINGLE_SELECT") {
          const productAttribute = {
            attributeSeq: parseInt(attribute.attributeSeq),
            attributeValueSeq: parseInt(attribute.selectedValue),
          };
          requestData.originProduct.detailAttribute.productAttributes.push(
            productAttribute
          );
        }
      }
    } catch (error) {
      return res.status(500).json({
        error: error,
      });
    }

    // console.log("요청 데이터:", JSON.stringify(requestData, null, 2));

    // 상품등록 API 요청 
    try {
      const apiUrl = "https://api.commerce.naver.com/external/v2/products";
      const headers = {
        Authorization: `Bearer ${accessToken.access_token}`,
        "Content-Type": "application/json",
      };
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`${product} 상품등록 응답:`, data);
        results.push({ product, response: data });
      } else {
        const errorMessage = await response.text();
        console.error("Error:", errorMessage);
        results.push({ product, error: errorMessage });
      }
    } catch (error) {
      console.error(`${product} API 요청 에러:`, error);
      results.push({ product, error: error.message });
    }
  }
  return res.json(results);
});

// 네이버 상품 삭제 API
app.delete("/NdeleteProducts", async (req, res) => {
  console.log("상품 삭제");
  const accName = req.body.accName;
  const selectedProducts = req.body.selectedProducts;

  try {
    // 계정 API Key 조회
    let accData = await db.collection("Accounts").doc(accName).get();
    if (!accData.exists) {
      console.log("No such document!");
      throw new Error("ACC 데이터 조회 실패");
    }
    accData = accData.data();
    console.log("계정명:", accData.id);

    const n_id = accData.n_id; // app ID
    const n_sk = accData.n_sk; // Secret Key
    const accessToken = await getAccessToken(n_id, n_sk, "SELF");

    // 선택한 상품들을 순차적으로 삭제
    for (const product of selectedProducts) {
      // 0.5초 대기
      await new Promise((resolve) => setTimeout(resolve, 500));

      const originProductNo = product.productId;
      const response = await fetch(
        `https://api.commerce.naver.com/external/v2/products/origin-products/${originProductNo}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log(await response.text());
        console.log(`상품 ${originProductNo} 삭제 성공`);
      } else {
        const errorMessage = await response.text();
        console.error(`상품 ${originProductNo} 삭제 실패:`, errorMessage);
        throw new Error(`상품 ${originProductNo} 삭제 실패: ${errorMessage}`);
      }
    }

    res.status(200).json({
      code: "SUCCESS",
      message: "상품 삭제가 완료되었습니다.",
      data: null,
    });
  } catch (error) {
    console.error("상품 삭제 중 오류 발생:", error);
    res.status(500).json({
      code: "ERROR",
      message: "상품 삭제 중 오류가 발생했습니다.",
      data: null,
    });
  }
});

// 네이버 판매상태 변경 API
app.put("/NchangeProductStatus", async (req, res) => {
  console.log("네이버 판매상태 변경");

  try {
    // 계정 API Key 조회
    let accData = await db.collection("Accounts").doc(req.body.accName).get();
    if (!accData.exists) {
      console.log("No such document!");
      throw new Error("ACC 데이터 조회 실패");
    }
    accData = accData.data();
    console.log("계정명:", accData.id);

    const n_id = accData.n_id; // app ID
    const n_sk = accData.n_sk; // Secret Key
    const accessToken = await getAccessToken(n_id, n_sk, "SELF");

    // 요청 데이터
    const products = req.body.selectedProducts;
    const statusTo = req.body.selectedStatus;

    // 선택한 상품들을 순차적으로 판매상태 변경
    for (const product of products) {
      console.log(product.productId);
      // 0.5초 대기
      await new Promise((resolve) => setTimeout(resolve, 500));

      const NowStatus = await NgetProductDetail(
        accessToken.access_token,
        product.productId
      );
      const NowStatusType = NowStatus.originProduct.statusType;
      console.log("NowStatusType:", NowStatusType);

      if (NowStatusType === statusTo) {
        console.log("이미 판매상태가 변경되었습니다.");
        continue;
      }

      let ProcessStatus = [];

      if (statusTo === "SUSPENSION" && NowStatusType === "SALE") {
        ProcessStatus = ["SUSPENSION"];
      } else {
        ProcessStatus = ["SALE"];
      }

      for (const status of ProcessStatus) {
        // 품절처리일 경우 재고 수량 0 추가
        let body = {};
        if (status == "SALE" && NowStatusType == "OUTOFSTOCK") {
          body = {
            statusType: status,
            stockQuantity: 999999,
          };
        } else {
          body = {
            statusType: status,
          };
        }

        const response = await fetch(
          `https://api.commerce.naver.com/external/v1/products/origin-products/${product.productId}/change-status`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        // console.log("response:", response);

        if (response.ok) {
          console.log(await response.text());
          console.log(`상품 ${product.productId} 판매상태 변경 성공`);
        } else {
          const errorMessage = await response.text();
          console.error(
            `상품 ${product.productId} 판매상태 변경 실패:`,
            errorMessage
          );
          throw new Error(
            `상품 ${product.productId} 판매상태 변경 실패: ${errorMessage}`
          );
        }
      }
    }

    res.json({ message: "상품 상태 변경을 완료하였습니다." });
  } catch (error) {
    console.error("상품 상태 변경 에러:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

exports.app = functions.region('asia-northeast3').https.onRequest(app);
