#version 300 es
precision mediump float;

in vec3 a_position;
in vec2 a_texCoord;

uniform mat4 u_transformation;

out vec2 o_TexCoord;

void main () {
  gl_Position = u_transformation * vec4(a_position.x, a_position.y, a_position.z, 1.0);
  o_TexCoord = a_texCoord;
}
