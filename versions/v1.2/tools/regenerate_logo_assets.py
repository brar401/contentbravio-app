from PIL import Image
import cv2,numpy as np,os,json,shutil
from pathlib import Path
root=str(Path(__file__).resolve().parents[1])
os.makedirs(root+'/public/logos/original',exist_ok=True)
os.makedirs(root+'/public/geometry',exist_ok=True)
entries=[('without',root+'/public/logos/original/without.png',np.array([169.,150.,110.]),np.array([139.,1.,29.])),('with',root+'/public/logos/original/with.png',np.array([171.,154.,113.]),np.array([121.,17.,36.]))]
for label,path,gold,maroon in entries:
 # Keep originals untouched; only render derivatives.
 rgb=np.array(Image.open(path).convert('RGB')).astype(np.float32)
 b=rgb-255.
 prototypes=np.array([gold,maroon],dtype=np.float32)
 v=prototypes-255.
 dots=np.einsum('ijk,mk->ijm',b,v)
 alpha=np.clip(dots/np.sum(v*v,axis=1),0,1)
 errors=np.sum((b[:,:,None,:]-alpha[:,:,:,None]*v[None,None,:,:])**2,axis=-1)
 # for barely visible pixels, pick nearest prototype: no white noise allowed
 category=np.argmin(errors,axis=2)
 A=np.take_along_axis(alpha,category[:,:,None],axis=2)[:,:,0]
 A=np.clip((A-0.014)/0.986,0,1)
 A[A<0.018]=0
 # preserve precise original colors in opaque areas and undo white contamination for antialiasing
 fg=np.zeros_like(rgb)
 for idx,col in enumerate(prototypes):
  region=category==idx
  reconstructed=255+(rgb-255)/np.maximum(A[:,:,None],.055)
  reconstructed=np.clip(reconstructed,0,255)
  # Blend towards calibrated brand color where alpha is low to reduce white halos
  result=(A[:,:,None]*rgb+(1-A[:,:,None])*col)
  use=(0.75*result+0.25*reconstructed)
  fg[region]=np.clip(use[region],0,255)
 rgba=np.uint8(np.dstack([fg,np.rint(A*255)]))
 Image.fromarray(rgba,'RGBA').save(root+'/public/logos/'+label+'.png',optimize=True)
 # Create mask polygons via contour tracing on a reduced-resolution alpha field
 targetW=850 if label=='without' else 820
 scale=targetW/rgb.shape[1]
 smallA=cv2.resize(A,None,fx=scale,fy=scale,interpolation=cv2.INTER_AREA)
 smallcat=cv2.resize(category.astype('uint8'),(smallA.shape[1],smallA.shape[0]),interpolation=cv2.INTER_NEAREST)
 shape_data=[]
 for index,cname in enumerate(['gold','burgundy']):
  mask=np.uint8((smallA>0.34)&(smallcat==index))*255
  # Smooth isolated noise but retain thin characters
  count,_,_,_=cv2.connectedComponentsWithStats(mask,connectivity=8)
  contours,hierarchy=cv2.findContours(mask,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_SIMPLE)
  if hierarchy is None: continue
  hier=hierarchy[0]
  n=0
  for i,c in enumerate(contours):
   if hier[i,3]!=-1 or abs(cv2.contourArea(c))<2.0: continue
   poly=cv2.approxPolyDP(c,.28,True).reshape(-1,2).tolist()
   if len(poly)<3: continue
   holes=[];child=hier[i,2]
   while child!=-1:
    ch=contours[child]
    if abs(cv2.contourArea(ch))>2:
     verts=cv2.approxPolyDP(ch,.25,True).reshape(-1,2).tolist()
     if len(verts)>2:holes.append(verts)
    child=hier[child,0]
   shape_data.append({'c':cname,'outer':poly,'holes':holes});n+=1
  print(label,cname,'shapes',n)
 payload={'width':smallA.shape[1],'height':smallA.shape[0],'shapes':shape_data}
 with open(root+'/public/geometry/'+label+'.json','w') as f: json.dump(payload,f,separators=(',',':'))
 print(label,'output',len(shape_data),'polygons',os.stat(root+'/public/geometry/'+label+'.json').st_size,'bytes', 'logo png',os.stat(root+'/public/logos/'+label+'.png').st_size)

