package com.example.erp.util;

import java.util.Map;

/**
 * 根據資產名稱自動對應：資產科目、折舊費用科目、累積折舊科目
 */
public class AssetAccountMapper {

    /** 資產對應設定 */
    public record AssetAccountMapping(String assetCode, String expenseCode, String accumulatedCode) {}

    private static final Map<String, AssetAccountMapping> assetMap = Map.of(
        "預付租金", new AssetAccountMapping("1131000", "7480001", "1131001"),
        "預付保險費", new AssetAccountMapping("1132000", "7480002", "1132001"),
        "預付軟體使用費", new AssetAccountMapping("1821000", "7481000", "1821001"),
        "預付費用", new AssetAccountMapping("1821000", "7481000", "1821001")
        // 你可以繼續加更多對應
    );
    private static final Map<String, AssetAccountMapping> FAMap = Map.of(
            "租金", new AssetAccountMapping("1131000", "7480001", "1131001"),
            "保險", new AssetAccountMapping("1132000", "7480002", "1132001"),
            "水電費", new AssetAccountMapping("1821000", "7481000", "1821001"),
            "維修費", new AssetAccountMapping("1821000", "7481000", "1821001")
            // 你可以繼續加更多對應
        );
    private static final Map<String, AssetAccountMapping> IAMap = Map.of(
            "資訊設備", new AssetAccountMapping("1131000", "7480001", "1131001"),
            "機械設備", new AssetAccountMapping("1132000", "7480002", "1132001"),
            "專利權", new AssetAccountMapping("1821000", "7481000", "1821001")
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
    public static AssetAccountMapping getISByAssetName(String assetName) {
        AssetAccountMapping mapping = IAMap.get(assetName);
        if (mapping == null) {
            throw new IllegalArgumentException("找不到對應資產科目設定: " + assetName);
        }
        return mapping;
    }
} 
