import { createSlice, current  } from '@reduxjs/toolkit'

export const configuratorSlice = createSlice({
  name: 'configurator',
  initialState: {
    chairMaterial: [
      { name: 'Stof',
        map: 'Fabric08_4K_BaseColor.jpg',
        normalMap: 'Fabric08_4K_Normal.jpg',
        metalnessMap: '',
        roughnessMap: 'Fabric08_4K_Roughness.jpg',
      },
      { name: 'Flueel',
        map: 'FabricVelourPlain003_COL_8K.jpg',
        normalMap: 'FabricVelourPlain003_NRM_8K.jpg',
        metalnessMap: 'FabricVelourPlain003_METALNESS_8K.jpg',
        roughnessMap: 'FabricVelourPlain003_ROUGHNESS_8K.jpg',
     },
      { name: 'Leer', 
        map: 'FabricLeatherBlack001_COL_4K.jpg',
        normalMap: 'FabricLeatherBlack001_NRM_4K.jpg',
        metalnessMap: '',
        roughnessMap: 'FabricLeatherBlack001_ROUGH_4K.jpg',
        }
    ],
    legTypeOption: [
      { name: 'Rond', glb: 'Sofa_Legs_Round.glb', image: 'Legs-01.png'},
      { name: 'Vierkant', glb: 'Sofa_Legs_Square.glb', image: 'Legs-02.png'},
    ],
    legType: { name: 'Rond', glb: 'Sofa_Legs_Round.glb'},
    LegMaterial: [
      { name: 'Chroom',
        map: 'MetalAluminum001_COL_4K.jpg',
        normalMap: 'MetalAluminum001_NRM_4K.jpg',
        metalnessMap: '',
        roughnessMap: 'MetalAluminum001_ROUGHNESS_4K.jpg',
      },
      { name: 'Metaal', 
        map: 'MetalGraphiteSatin001_COL_8K.jpg',
        normalMap: 'MetalGraphiteSatin001_NRM_8K.jpg',
        metalnessMap: 'MetalGraphiteSatin001_METALNESS_8K.jpg',
        roughnessMap: 'MetalGraphiteSatin001_ROUGHNESS_8K.jpg',
      },
      { name: 'Hout', 
        map: 'WoodFineDark001_COL_4K.jpg',
        normalMap: 'WoodFineDark001_NRM_4K.jpg',
        metalnessMap: '',
        roughnessMap: 'WoodFineDark001_ROUGH_4K.jpg',
      },
    ],
    selectedChairMaterial: {
      name: 'Stof',
      map: 'Fabric08_4K_BaseColor.jpg',
      normalMap: 'Fabric08_4K_Normal.jpg',
      metalnessMap: '',
      roughnessMap: 'Fabric08_4K_Roughness.jpg',
    },
    selectedLegMaterial: {
      name: 'Legs Wood', 
      map: 'WoodFineDark001_COL_4K.jpg',
      normalMap: 'WoodFineDark001_NRM_4K.jpg',
      metalnessMap: '',
      roughnessMap: 'WoodFineDark001_ROUGH_4K.jpg',
    },
    sofaColorOptions: {
      'Flueel': [
        { name: 'Beige', color: 'FabricVelourPlain003_COL_Beige.png'},
        { name: 'Zwart',  color: 'FabricVelourPlain003_COL_Black.png'},
        { name: 'Blauw', color: 'FabricVelourPlain003_COL_Blue.png'},
        { name: 'Bruin', color: 'FabricVelourPlain003_COL_Brown.png'},
        { name: 'Oranje', color: 'FabricVelourPlain003_COL_Orange.png'},
        { name: 'Roze', color: 'FabricVelourPlain003_COL_Pink.png'},
        { name: 'Paars', color: 'FabricVelourPlain003_COL_Purple.png'},
        { name: 'Rood', color: 'FabricVelourPlain003_COL_Red.png'},
        { name: 'Blauw-groen', color: 'FabricVelourPlain003_COL_Teal.png'},
        { name: 'Geel', color: 'FabricVelourPlain003_COL_Yellow.png'},
      ],
      'Leer': [
        { name: 'Beige', color: 'FabricLeatherBlack001_COL_Beige.png'},
        { name: 'Zwart', color: 'FabricLeatherBlack001_COL_Black.png'},
        { name: 'Blauw', color: 'FabricLeatherBlack001_COL_Blue.png'},
        { name: 'Bruin', color: 'FabricLeatherBlack001_COL_Brown.png'},
        { name: 'Oranje', color: 'FabricLeatherBlack001_COL_Orange.png'},
        { name: 'Roze', color: 'FabricLeatherBlack001_COL_Pink.png'},
        { name: 'Paars', color: 'FabricLeatherBlack001_COL_Purple.png'},
        { name: 'Rood', color: 'FabricLeatherBlack001_COL_Red.png'},
        { name: 'Blauw-groen', color: 'FabricLeatherBlack001_COL_Teal.png'},
        { name: 'Geel', color: 'FabricLeatherBlack001_COL_Yellow.png'},
      ],
      'Stof': [
        { name: 'Beige', color: 'Fabric08_4K_BaseColor_Beige.png'},
        { name: 'Zwart',  color: 'Fabric08_4K_BaseColor_Black.png'},
        { name: 'Blauw',  color: 'Fabric08_4K_BaseColor_Blue.png'},
        { name: 'Bruin', color: 'FabricVelourPlain003_COL_Brown.png'},
        { name: 'Oranje',  color: 'Fabric08_4K_BaseColor_Orange.png'},
        { name: 'Roze', color: 'Fabric08_4K_BaseColor_Pink.png'},
        { name: 'Paars', color: 'Fabric08_4K_BaseColor_Purple.png'},
        { name: 'Rood', color: 'Fabric08_4K_BaseColor_Red.png'},
        { name: 'Blauw-groen', color: 'Fabric08_4K_BaseColor_Teal.png'},
        { name: 'Geel', color: 'Fabric08_4K_BaseColor_Yellow.png'},
      ]
    },
    selectedSofaColor:  { name: 'Blauw',  color: 'Fabric08_4K_BaseColor_Blue.png'},
    legColor: { name: 'Briar Smoke', color: 'WoodFineDark001_COL_4K.jpg', image: 'WoodFineDark001_COL_4K_Circle.jpg'},
    legColorOptions: {
      'Chroom': [
        { name: 'Bronzen', color: '4K-Metallic_bronze_Base Color.png', image: '4K-Metallic_bronze_Base Color_Circle.png'},
        { name: 'Chroom', color: '4K-Metallic_Chrome_Base Color.png', image: '4K-Metallic_Chrome_Base Color_Circle.png'},
        { name: 'Goud',  color: '4K-Metallic_gold_Base Color.jpg', image: '4K-Metallic_gold_Base Color_Circle.png'},
        { name: 'Rosé goud', color: '4K-Metallic_rosegold_Base Color.png', image: '4K-Metallic_rosegold_Base Color_Circle.png'},
        { name: 'Zilver', color: '4K-Metallic_silver_Base Color.png', image: '4K-Metallic_silver_Base Color_Circle.png'},
      ],
      'Metaal': [
        { name: 'default', color: 'MetalGraphiteSatin001_COL_8K.jpg', image: 'MetalGraphiteSatin001_COL_8K_Circle.png'},
        { name: 'Bruin', color: 'MetalGraphiteSatin001_COL_8K_Brown.png', image: 'MetalGraphiteSatin001_COL_8K_Brown_Circle.png'},
        { name: 'Blauw',  color: 'MetalGraphiteSatin001_COL_8KBlue.png', image: 'MetalGraphiteSatin001_COL_8KBlue_Circle.png'},
        { name: 'Wit', color: 'MetalGraphiteSatin001_COL_White.png', image: 'MetalGraphiteSatin001_COL_White_Circle.png'},
        { name: 'Beige', color: 'MetalGraphiteSatin001_COL_8K_Beige.png', image: 'MetalGraphiteSatin001_COL_8K_Beige_Circle.png'},
        { name: 'Zwart', color: 'MetalGraphiteSatin001_COL_8K_Black.png', image: 'MetalGraphiteSatin001_COL_8K_Black_Circle.png'},
        { name: 'Donker Bruin',  color: 'MetalGraphiteSatin001_COL_8K_DarkBrown.png', image: 'MetalGraphiteSatin001_COL_8K_DarkBrown_Circle.png'},
        { name: 'Donker Rood', color: 'MetalGraphiteSatin001_COL_8K_DarkRed.png', image: 'MetalGraphiteSatin001_COL_8K_DarkRed_Circle.png'}, 
        { name: 'Blauwgroen', color: 'MetalGraphiteSatin001_COL_8K_Teal.png', image: 'MetalGraphiteSatin001_COL_8K_Teal_Circle.png'}, 
      ],
      'Hout': [
        { name: 'Briar Smoke', color: 'WoodBriarsmoke_COL_4K.png', image: 'WoodBriarsmoke_COL_4K_Circle.png'},
        { name: 'Early American', color: 'WoodEarlyAmerican_COL_4K.png', image: 'WoodEarlyAmerican_COL_4K_Circle.png'},
        { name: 'Ebony',  color: 'WoodEbony_COL_4K.png', image: 'WoodEbony_COL_4K_Circle.png'},
        { name: 'Fijn donker', color: 'WoodFineDark_COL_4K.jpg', image: 'WoodFineDark_COL_4K_Circle.png'},
        { name: 'Honey Maple', color: 'WoodHoneyMaple_COL_4K.png', image: 'WoodHoneyMaple_COL_4K_Circle.png'},
        { name: 'Grijs', color: 'WoodGrey_COL_4K.png', image: 'WoodGrey_COL_4K_Circle.png'},
        { name: 'Licht Bruin', color: 'WoodLightBrown_COL_4K.png', image: 'WoodLightBrown_COL_4K_Circle.png'},
        { name: 'Oranje',  color: 'WoodOrange_COL_4K.png', image: 'WoodOrange_COL_4K_Circle.png'},
        { name: 'Zwart', color: 'WoodBlack_COL_4K.png', image: 'WoodBlack_COL_4K_Circle.png'},
        { name: 'Wit', color: 'WoodWhite_COL_4K.png', image: 'WoodWhite_COL_4K_Circle.png'},
      ]
    }
  },
  reducers: {
    selectchairMaterialType: (state, action) => {
      let material = state.chairMaterial.find((m) => m.name === action.payload)
        state.selectedChairMaterial = material
    },
    selectLegMaterialType: (state, action) => {
        state.selectedLegMaterial = action.payload
    },
    selectsofaColor: (state, action) => {
      state.selectedSofaColor = action.payload;
    },
    selectLegType: (state, action) => {
      state.legType = action.payload;
    },
    selectLegColor: (state, action) => {
      state.legColor = action.payload;
    },
  }
})


export const { selectchairMaterialType, selectLegMaterialType, selectsofaColor, selectLegType, selectLegColor  } = configuratorSlice.actions

export default configuratorSlice.reducer