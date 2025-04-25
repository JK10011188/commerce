// ...existing code...
const getNoti = (type) => {
    switch (type) {
        case 'WEAR':
            return {
                material : '상품상세 참조',
                color : '상품상세 참조',
                size : '상품상세 참조',
                manufacturer : '상품상세 참조',
                caution : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                packDateText : '상품상세 참조',
            };
        case 'SHOES':
            return {
                material : '상품상세 참조',
                color : '상품상세 참조',
                size : '상품상세 참조',
                height : '상품상세 참조',
                manufacturer : '상품상세 참조',
                caution : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
            };
        case 'BAG':
            return {
                type : '상품상세 참조',
                material : '상품상세 참조', 
                color : '상품상세 참조',
                size : '상품상세 참조',
                manufacturer : '상품상세 참조',
                caution : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
            };
        case 'FASHION_ITEMS':
            return {
                type : '상품상세 참조',
                material : '상품상세 참조',
                color : '상품상세 참조',
                size : '상품상세 참조',
                manufacturer : '상품상세 참조',
                caution : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
            };
        case 'SLEEPING_GEAR':
            return {
                material : '상품상세 참조',
                color : '상품상세 참조',
                size : '상품상세 참조',
                components : '상품상세 참조',
                manufacturer : '상품상세 참조',
                caution : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
            };
        case 'FURNITURE':
            return {
                itemName : '상품상세 참조',
                certificationType : '상품상세 참조',
                color : '상품상세 참조',
                components : '상품상세 참조',
                material : '상품상세 참조',
                manufacturer : '상품상세 참조',
                importer : '상품상세 참조',
                producer : '상품상세 참조',
                size : '상품상세 참조',
                installedCharge : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                refub : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
            };
        case 'IMAGE_APPLIANCES':
            return{
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                manufacturer : '상품상세 참조',
                size : '상품상세 참조',
                additionalCost : '상품상세 참조',
                displaySpecification : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'HOME_APPLIANCES':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                manufacturer : '상품상세 참조',
                size : '상품상세 참조',
                additionalCost : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'SEASON_APPLIANCES':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                manufacturer : '상품상세 참조',
                size : '상품상세 참조',
                area : '상품상세 참조',
                installedCharge : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'OFFICE_APPLIANCES':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                manufacturer : '상품상세 참조',
                size : '상품상세 참조',
                weight : '상품상세 참조',
                specification : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'OPTICS_APPLIANCES':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                manufacturer : '상품상세 참조',
                size : '상품상세 참조',
                weight : '상품상세 참조',
                specification : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'MICROELECTRONICS':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                ratedVoltage : '상품상세 참조',
                powerConsumption : '상품상세 참조',
                manufacturer : '상품상세 참조',
                size : '상품상세 참조',
                weight : '상품상세 참조',
                specification : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'CELLPHONE':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                manufacturer : '상품상세 참조',
                producer : '상품상세 참조',
                size : '상품상세 참조',
                telecomType : '상품상세 참조',
                joinProcess : '상품상세 참조',
                extraBurden : '상품상세 참조',
                specification : '상품상세 참조',
                weight : '상품상세 참조',
                releaseDateText : '상품상세 참조',
                specification : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
            };
        case 'NAVIGATION':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                ratedVoltage : '상품상세 참조',
                powerConsumption : '상품상세 참조',
                manufacturer : '상품상세 참조',
                size : '상품상세 참조',
                weight : '상품상세 참조',
                specification : '상품상세 참조',
                updateCost : '상품상세 참조',
                freeCostPeriod : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'CAR_ARTICLES':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                caution : '상품상세 참조',
                manufacturer : '상품상세 참조',
                size : '상품상세 참조',
                applyModel : '상품상세 참조',
                roadWorthyCertification : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'MEDICAL_APPLIANCES':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                advertisingCertificationType : '상품상세 참조',
                purpose : '상품상세 참조',
                manufacturer : '상품상세 참조',
                usage : '상품상세 참조',
                caution : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'KITCHEN_UTENSILS':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                material : '상품상세 참조',
                component : '상품상세 참조',
                size : '상품상세 참조',
                manufacturer : '상품상세 참조',
                producer : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'COSMETIC':
            return {
                capacity : '상품상세 참조',
                specification : '상품상세 참조',
                usage : '상품상세 참조',
                manufacturer : '상품상세 참조',
                expirationDateText : '상품상세 참조',
                producer : '상품상세 참조',
                distributor : '상품상세 참조',
                mainIngredient : '상품상세 참조',
                certificationType : '상품상세 참조',
                caution : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                customerServicePhoneNumber : '상품상세 참조',
            };
        case 'JEWELLERY':
            return {
                material : '상품상세 참조',
                purity : '상품상세 참조',
                weight : '상품상세 참조',
                manufacturer : '상품상세 참조',
                size : '상품상세 참조',
                caution : '상품상세 참조',
                specification : '상품상세 참조',
                provideWarranty : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
            };
        case 'FOOD':
            return {
                foodItem : '상품상세 참조',
                weight : '상품상세 참조',
                amount : '상품상세 참조',
                size : '상품상세 참조',
                producer : '상품상세 참조',
                productComposition : '상품상세 참조',
                keep : '상품상세 참조',
                adCaution : '상품상세 참조',
                customerServicePhoneNumber : '상품상세 참조',
                packDateText : '상품상세 참조',
                consumptionDateText : '상품상세 참조',
            };
        case 'GENERAL_FOOD':
            return {
                productName : '상품상세 참조',
                foodType : '상품상세 참조',
                producer : '상품상세 참조',
                location : '상품상세 참조',
                weight : '상품상세 참조',
                amount : '상품상세 참조',
                ingredients : '상품상세 참조',
                geneticallyModified : false,
                consumerSafetyCaution : '상품상세 참조',
                importDeclarationCheck : false,
                packDateText : '상품상세 참조',
                consumptionDateText : '상품상세 참조',
                customerServicePhoneNumber : '상품상세 참조',
            };
        case 'DIET_FOOD':
            return {
                productName : '상품상세 참조',
                producer : '상품상세 참조',
                location : '상품상세 참조',
                storageMethod : '상품상세 참조',
                weight : '상품상세 참조',
                amount : '상품상세 참조',
                ingredients : '상품상세 참조',
                nutritionFacts : '상품상세 참조',
                specification : '상품상세 참조',
                cautionAndSideEffect : '상품상세 참조',
                nonMedicinalUsesMessage : '상품상세 참조',
                geneticallyModified : false,
                consumerSafetyCaution : '상품상세 참조',
                importDeclarationCheck : false,
                customerServicePhoneNumber : '상품상세 참조',
                consumptionDateText : '상품상세 참조',
            };
        case 'KIDS':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                size : '상품상세 참조',
                weight : '상품상세 참조',
                color : '상품상세 참조',
                material : '상품상세 참조',
                recommendedAge : '상품상세 참조',
                manufacturer : '상품상세 참조',
                caution : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'MUSICAL_INSTRUMENT':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                size : '상품상세 참조',
                weight : '상품상세 참조',
                color : '상품상세 참조',
                material : '상품상세 참조',
                manufacturer : '상품상세 참조',
                caution : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'SPORTS_EQUIPMENT':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                certificationType : '상품상세 참조',
                size : '상품상세 참조',
                weight : '상품상세 참조',
                color : '상품상세 참조',
                material : '상품상세 참조',
                components : '상품상세 참조',
                manufacturer : '상품상세 참조',
                detailContents : '상품상세 참조',
                warrantyPolicy : '상품상세 참조',
                afterServiceDirector : '상품상세 참조',
                releaseDateText : '상품상세 참조',
            };
        case 'BOOKS':
            return {
                title : '상품상세 참조',
                author : '상품상세 참조',
                publisher : '상품상세 참조',
                size : '상품상세 참조',
                pages : '상품상세 참조',
                description : '상품상세 참조',
                publishDateText : '상품상세 참조',
            };
        case 'RENTAL_ETC':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                payingForLossOrDamage : '상품상세 참조',
                refundPolicyForCancel : '상품상세 참조',
                customerServicePhoneNumber : '상품상세 참조',
            };
        case 'RENTAL_HA':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                payingForLossOrDamage : '상품상세 참조',
                refundPolicyForCancel : '상품상세 참조',
                customerServicePhoneNumber : '상품상세 참조',
            };
        case 'DIGITAL_CONTENTS':
            return {
                producer : '상품상세 참조',
                termsOfUse : '상품상세 참조',
                usePeriod : '상품상세 참조',
                medium : '상품상세 참조',
                requirement : '상품상세 참조',
                cancelationPolicy : '상품상세 참조',
                customerServicePhoneNumber : '상품상세 참조',
            };
        case 'GIFT_CARD':
            return {
                issuer : '상품상세 참조',
                termsOfUse : '상품상세 참조',
                refundPolicy : '상품상세 참조',
                customerServicePhoneNumber : '상품상세 참조',
                useStorePlace   : '상품상세 참조',
            };
        case 'MOBILE_COUPON':
            return {
                issuer : '상품상세 참조',
                usableCondition : '상품상세 참조',
                usableStore : '상품상세 참조',
                cancelationPolicy : '상품상세 참조',
                customerServicePhoneNumber : '상품상세 참조',
            };
        case 'MOVIE_SHOW':
            return {
                sponsor : '상품상세 참조',
                actor : '상품상세 참조',
                rating : '상품상세 참조',
                showTime : '상품상세 참조',
                showPlace : '상품상세 참조',
                cancelationCondition : '상품상세 참조',
                cancelationPolicy : '상품상세 참조',
                customerServicePhoneNumber : '상품상세 참조',
            };
        case 'ETC_SERVICE':
            return {
                serviceProvider : '상품상세 참조',
                certificateDetails : '상품상세 참조',
                usableCondition : '상품상세 참조',
                cancelationStandard : '상품상세 참조',
                cancelationPolicy   : '상품상세 참조',
                customerServicePhoneNumber : '상품상세 참조',
            }
        case 'BIOCHEMISTRY':
            return {
                productName : '상품상세 참조',
                dosageForm : '상품상세 참조',
                weight : '상품상세 참조',
                effect : '상품상세 참조',
                producer : '상품상세 참조',
                manufacturer : '상품상세 참조',
                childProtection : '상품상세 참조',
                chemicals : '상품상세 참조',
                caution : '상품상세 참조',
                safeCriterionNo: '상품상세 참조',
                customerServicePhoneNumber  : '상품상세 참조',
                expirationDateText : '상품상세 참조',
                packDateText : '상품상세 참조',
            }
        case 'BIOCIDAL':
            return {
                productName : '상품상세 참조',
                weight : '상품상세 참조',
                effect : '상품상세 참조',
                rangeOfUse : '상품상세 참조',
                producer : '상품상세 참조',
                manufacturer    : '상품상세 참조',
                childProtection : '상품상세 참조',
                harmfulChemicalSubstance : '상품상세 참조',
                maleficence : '상품상세 참조',
                caution : '상품상세 참조',
                approvalNumber : '상품상세 참조',
                customerServicePhoneNumber : '상품상세 참조',
                expirationDateText : '상품상세 참조',
            }
        case 'ETC':
            return {
                itemName : '상품상세 참조',
                modelName : '상품상세 참조',
                manufacturer : '상품상세 참조',
                afterServiceDirector: '상품상세 참조',
            };
        default:
            return 'Unknown notification type!';
    }
};

const getNoticeTypeString = (type) => {
    if (type === "WEAR") {
      return "wear";
    } else if (type === "SHOES") {
      return "shoes";
    } else if (type === "BAG") {
      return "bag";
    } else if (type === "FASHION_ITEMS") {
      return "fashionItems";
    } else if (type === "SLEEPING_GEAR") {
      return "sleepingGear";
    } else if (type === "FURNITURE") {
      return "furniture";
    } else if (type === "IMAGE_APPLIANCES") {
      return "imageAppliances";
    } else if (type === "HOME_APPLIANCES") {
      return "homeAppliances";
    } else if (type === "SEASON_APPLIANCES") {
      return "seasonAppliances";
    } else if (type === "OFFICE_APPLIANCES") {
      return "officeAppliances";
    } else if (type === "OPTICS_APPLIANCES") {
      return "opticsAppliances";
    } else if (type === "MICROELECTRONICS") {
      return "microElectronics";
    } else if (type === "NAVIGATION") {
      return "navigation";
    } else if (type === "CAR_ARTICLES") {
      return "carArticles";
    } else if (type === "MEDICAL_APPLIANCES") {
      return "medicalAppliances";
    } else if (type === "KITCHEN_UTENSILS") {
      return "kitchenUtensils";
    } else if (type === "COSMETIC") {
      return "cosmetic";
    } else if (type === "JEWELLERY") {
      return "jewellery";
    } else if (type === "FOOD") {
      return "food";
    } else if (type === "GENERAL_FOOD") {
      return "generalFood";
    } else if (type === "DIET_FOOD") {
      return "dietFood";
    } else if (type === "KIDS") {
      return "kids";
    } else if (type === "MUSICAL_INSTRUMENT") {
      return "musicalInstrument";
    } else if (type === "SPORTS_EQUIPMENT") {
      return "sportsEquipment";
    } else if (type === "BOOKS") {
      return "books";
    } else if (type === "RENTAL_ETC") {
      return "rentalEtc";
    } else if (type === "RENTAL_HA") {
      return "rentalHa";
    } else if (type === "DIGITAL_CONTENTS") {
      return "digitalContents";
    } else if (type === "GIFT_CARD") {
      return "giftCard";
    } else if (type === "MOBILE_COUPON") {
      return "mobileCoupon";
    } else if (type === "MOVIE_SHOW") {
      return "movieShow";
    } else if (type === "ETC_SERVICE") {
      return "etcService";
    } else if (type === "BIOCHEMISTRY") {
      return "biochemistry";
    } else if (type === "BIOCIDAL") {
      return "biocidal";
    } else if (type === "CELLPHONE") {
      return "cellPhone";
    } else if (type === "ETC") {
      return "etc";
    } else {
      return "etc";
    }
  };

module.exports = {
  getNoti,
  getNoticeTypeString,
};
