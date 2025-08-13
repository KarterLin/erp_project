package com.example.erp.util;

import java.util.Map;

/**
 * 根據資產名稱自動對應：資產科目、折舊費用科目、累積折舊科目
 */
public class AssetAccountMapper {

    /** 資產對應設定 */
    public record AssetAccountMapping(String assetCode, String expenseCode, String accumulatedCode) {}

    private static final Map<String, AssetAccountMapping> assetMap = Map.of(
        "預付租金", new AssetAccountMapping("1252000", "", ""),
        "預付保險費", new AssetAccountMapping("1253000", "", ""),
        "預付軟體使用費", new AssetAccountMapping("1256000", "", "")
        // 你可以繼續加更多對應
    );
    private static final Map<String, AssetAccountMapping> FAMap = Map.of(
            "土地", new AssetAccountMapping("1411000", "", ""),
            "房屋及建物", new AssetAccountMapping("1431000", "6103001", "1439000"),
            "資訊設備", new AssetAccountMapping("1441000", "6103002", "1449000"),
            "辦公設備", new AssetAccountMapping("1451000", "6103003", "1459000"),
            "運輸設備", new AssetAccountMapping("1461000", "6103004", "1469000"),
            "什項設備", new AssetAccountMapping("1471000", "6103005", "1479000")
            // 你可以繼續加更多對應
        );
    private static final Map<String, AssetAccountMapping> IAMap = Map.of(
    		"專利權", new AssetAccountMapping("1781000", "6103006", "1781001"),
            "商標權", new AssetAccountMapping("1782000", "6103007", "1782001"),
            "電腦軟體", new AssetAccountMapping("1783000", "6103008", "1783001")
            // 你可以繼續加更多對應
        );

    /**
     * 根據資產名稱取得對應科目代碼
     * @param assetName 資產名稱（如：資訊設備）
     * @return 對應的資產/費用/累積科目代碼
     */
    public static AssetAccountMapping getByAssetName(String assetName) {
        AssetAccountMapping mapping = assetMap.get(assetName);
        if (mapping == null) {
            throw new IllegalArgumentException("找不到對應資產科目設定: " + assetName);
        }
        return mapping;
    }
    public static AssetAccountMapping getFAByAssetName(String assetName) {
        AssetAccountMapping mapping = FAMap.get(assetName);
        if (mapping == null) {
            throw new IllegalArgumentException("找不到對應資產科目設定: " + assetName);
        }
        return mapping;
    }
    public static AssetAccountMapping getIAByAssetName(String assetName) {
        AssetAccountMapping mapping = IAMap.get(assetName);
        if (mapping == null) {
            throw new IllegalArgumentException("找不到對應資產科目設定: " + assetName);
        }
        return mapping;
    }
} 
